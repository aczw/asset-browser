from django.http import JsonResponse
from django.db.models import Q, Max, Min
from .models import Asset, Author, Commit
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils.s3_utils import S3Manager 
from django.utils import timezone
from django.db.models import OuterRef, Subquery

@api_view(['GET'])
def get_assets(request):
    try:
        # Get query parameters
        search = request.GET.get('search')
        author = request.GET.get('author')
        checked_in_only = request.GET.get('checkedInOnly') == 'true'
        sort_by = request.GET.get('sortBy', 'updated')

        # Base queryset
        assets = Asset.objects.all()

        earliest_commit = Commit.objects.filter(asset=OuterRef('pk')).order_by('timestamp')
        latest_commit   = Commit.objects.filter(asset=OuterRef('pk')).order_by('-timestamp')

        assets = assets.annotate(
            first_author_first = Subquery(
                earliest_commit.values('author__firstName')[:1]
            ),
            first_author_last  = Subquery(
                earliest_commit.values('author__lastName')[:1]
            ),
            first_ts  = Subquery(earliest_commit.values('timestamp')[:1]),
            latest_ts = Subquery(latest_commit.values('timestamp')[:1]),
        )

        # Apply search filter
        if search:
            assets = assets.filter(
                Q(assetName__icontains=search) |
                Q(keywordsList__keyword__icontains=search)
            ).distinct()
        
        # Apply checked-in filter
        if checked_in_only:
            assets = assets.filter(checkedOutBy__isnull=True)

        # Apply author filter
        if author:
            assets = assets.filter(
                Q(commits__author__firstName__icontains=author) |
                Q(commits__author__lastName__icontains=author)
            ).distinct()

        # Apply sorting and ensure uniqueness
        if sort_by == 'name':
            assets = assets.order_by('assetName')

        elif sort_by == 'author':
            # sort by the *creator* (author of the first commit)
            assets = assets.order_by('first_author_first', 'first_author_last')

        elif sort_by == 'updated':
            # most recently touched asset first
            assets = assets.order_by('-latest_ts')

        elif sort_by == 'created':
            # asset whose *first* commit is newest comes first
            assets = assets.order_by('-first_ts')


        # Convert to frontend format
        assets_list = []
        s3Manager = S3Manager();
        for asset in assets:
            try:
                # Get latest and first commits
                latest_commit = Commit.objects.filter(asset=asset).order_by('-timestamp').first()
                first_commit = Commit.objects.filter(asset=asset).order_by('timestamp').first()
                thumbnail_url = s3Manager.generate_presigned_url(asset.thumbnailKey) if asset.thumbnailKey else None

                assets_list.append({
                    'name': asset.assetName,
                    'thumbnailUrl': thumbnail_url,  # You'll need to handle S3 URL generation
                    'version': latest_commit.version if latest_commit else "01.00.00",
                    'creator': f"{first_commit.author.firstName} {first_commit.author.lastName}" if first_commit and first_commit.author else "Unknown",
                    'lastModifiedBy': f"{latest_commit.author.firstName} {latest_commit.author.lastName}" if latest_commit and latest_commit.author else "Unknown",
                    'checkedOutBy': asset.checkedOutBy.pennkey if asset.checkedOutBy else None,
                    'isCheckedOut': asset.checkedOutBy is not None,
                    'materials': latest_commit.sublayers.exists() if latest_commit else False,
                    'keywords': [k.keyword for k in asset.keywordsList.all()],
                    'description': latest_commit.note if latest_commit else "No description available",
                    'createdAt': first_commit.timestamp.isoformat() if first_commit else None,
                    'updatedAt': latest_commit.timestamp.isoformat() if latest_commit else None,
                })
            except Exception as e:
                print(f"Error processing asset {asset.assetName}: {str(e)}")
                continue

        return Response({'assets': assets_list})

    except Exception as e:
        print(f"Error in get_assets: {str(e)}")
        return Response({'error': str(e)}, status=500)
    
@api_view(['GET'])
def get_asset(request, asset_name):
    try:
        # Get the asset by name
        asset = Asset.objects.get(assetName=asset_name)
        
        # Get latest and first commits
        latest_commit = asset.commits.order_by('-timestamp').first()
        first_commit = asset.commits.order_by('timestamp').first()

        # Generate S3 URLs
        s3Manager = S3Manager();
        thumbnail_url = s3Manager.generate_presigned_url(asset.thumbnailKey) if asset.thumbnailKey else None

        # Format the response to match frontend's AssetWithDetails interface
        asset_data = {
            'name': asset.assetName,
            'thumbnailUrl': thumbnail_url,  # You'll need to handle S3 URL generation
            'version': latest_commit.version if latest_commit else "01.00.00",
            'creator': f"{first_commit.author.firstName} {first_commit.author.lastName}" if first_commit and first_commit.author else "Unknown",
            'lastModifiedBy': f"{latest_commit.author.firstName} {latest_commit.author.lastName}" if latest_commit and latest_commit.author else "Unknown",
            'checkedOutBy': asset.checkedOutBy.pennkey if asset.checkedOutBy else None,
            'isCheckedOut': asset.checkedOutBy is not None,
            'materials': latest_commit.sublayers.exists() if latest_commit else False,
            'keywords': [k.keyword for k in asset.keywordsList.all()],
            'description': latest_commit.note if latest_commit else "No description available",
            'createdAt': first_commit.timestamp.isoformat() if first_commit else None,
            'updatedAt': latest_commit.timestamp.isoformat() if latest_commit else None,
        }

        return Response({'asset': asset_data})

    except Asset.DoesNotExist:
        return Response({'error': 'Asset not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    
@api_view(['POST'])
def upload_S3_asset(request, asset_name):
    try:
        # On the frontend, we should first check if metadata exists
        # Metadata upload is a separate POST 
        s3 = S3Manager()

        prefix = f"{asset_name}"
        if len(s3.list_s3_files(prefix)) > 0:
            return Response({'error': 'Asset already found!'}, status=400)

        files = request.FILES.getlist('files')
        if not files:
            return Response({'error': 'Asset already found!'}, status=400)

        for file in files:
            s3.upload_file(file, f"{asset_name}/{file.name}")

        return Response({'message': 'Successfully uploaded'}, status=200)
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def checkout_asset(request, asset_name):
    try:
        print(f"Request data: {request.data}")
        print(f"Request headers: {request.headers}")
        
        # Get the asset
        try:
            asset = Asset.objects.get(assetName=asset_name)
            print(f"Found asset: {asset.assetName}")
        except Asset.DoesNotExist as e:
            print(f"Asset not found: {asset_name}")
            return Response({'error': 'Asset not found'}, status=404)
        
        # Get the user's pennkey from the request
        pennkey = request.data.get('pennkey')
        print(f"Received pennkey: {pennkey}")
        
        if not pennkey:
            return Response({'error': 'pennkey is required'}, status=400)

        # Check if asset is already checked out
        if asset.checkedOutBy:
            print(f"Asset already checked out by: {asset.checkedOutBy}")
            return Response({
                'error': f'Asset is already checked out by {asset.checkedOutBy.firstName} {asset.checkedOutBy.lastName}'
            }, status=400)

        # Get the user
        try:
            user = Author.objects.get(pennkey=pennkey)
            print(f"Found user: {user.firstName} {user.lastName}")
        except Author.DoesNotExist as e:
            print(f"User not found: {pennkey}")
            return Response({'error': 'User not found'}, status=404)

        # Check out the asset
        try:
            asset.checkedOutBy = user
            asset.save()
            print("Asset checked out successfully")
        except Exception as e:
            print(f"Error saving asset: {str(e)}")
            raise

        return Response({
            'message': 'Asset checked out successfully',
            'asset': {
                'name': asset.assetName,
                'checkedOutBy': user.pennkey,
                'isCheckedOut': True
            }
        })

    except Exception as e:
        print(f"Unexpected error in checkout_asset: {str(e)}")
        return Response({'error': str(e)}, status=500)
