# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).




# Backend Setup

### Database Setup
MySQL is local to your machine so you would have to set it up. (obviously there are ways of deploying, not sure how yet.)
1. Install MySQL if you haven’t already.
2. Create a new database:
   ```sql
   CREATE DATABASE assets;
   ```
   You can try using the root MySQL user or make your own (MySQL users are different across machines so ignore the passwords in info.txt. The Django superuser password is in there tho)
   To make your own account:
   ```CREATE USER 'your_user'@'localhost' IDENTIFIED BY 'your_password';
    GRANT ALL PRIVILEGES ON assets.* TO 'your_user'@'localhost';
    FLUSH PRIVILEGES;
   ```
   Then import the backup if you want the database already populated
   ```
   mysql -u your_user -p assets < filepath_to/database_backup.sql
   ```
   your_user can also be root, your database name should be 'assets'.

#### Example MacOS MySQLSetup:
   ```bash
      # Install mysql
      brew install mysql pkgconf

      # Start server
      brew services start mysql
      mysql -u root -p # Will prompt to set password

      > CREATE DATABASE assets;
   ```

   Then, for now, I needed to create a user in mysql that matches Aaron's account authentication. An alternative solution is to modify the `DATABASES` field within `./asset_library/settings.py` to your own preferred acount info. However, for the sake of keeping git diffs clean, I opted for the foremost-mentioned solution:
   
   ```sql
      > CREATE USER 'admin'@'localhost' IDENTIFIED BY 'terskayl';
      > GRANT ALL PRIVILEGES ON assets.* TO 'admin'@'localhost';
      > FLUSH PRIVILEGES;
   ```

   Lastly, import the backup.
   ```bash
   # In repo root directory
   mysql -u root -p assets < assets_backup.sql
   ```

### File Crawler Tool
  A script is also provided to create the database from scratch by crawling through the whole asset folder (i.e. Week 6 Assets).

  You still need MySQL to perform this step. There should be an assets db already created so Django can connect with it.

  1. Download our class's assets from Google Drive all in one folder and replace 
  `folder_path` in `./asset_library/library/script.py` with the folder location.
  2. Open the python shell for Django using `python manage.py shell` in console.
  3.  Run the following code:
      ```python
      from library.models import Asset, Keyword, AssetVersion, Commit
      # Clear current db
      Asset.objects.all().delete()
      from library.script import Script
      a = Script()
      a.runFileCrawler()
      # Can check entries added
      Asset.objects.all()
      ```
### Environment Setup
   Optional: Setup a Python virtual environment however you usually do.

   For example:
   ```bash
      # tested on macos
      mkdir venv
      python -m venv ./venv
      source venv/bin/activate
   ```

   Install python dependencies:

   `pip install -r requirements.txt`

   This will automatically install all the pip packages we used in our package. These most importantly include:
   - Django
   - mysqlclient
   - mysql-connector-python

### S3 Integration Setup

To enable asset downloading from AWS S3, you’ll need to add a `.env` file at the root of the project containing your credentials:

1. Create a `.env` file in the root directory (next to `manage.py`) with the following content:

   ```env
   AWS_ACCESS_KEY_ID=your-access-key-id
   AWS_SECRET_ACCESS_KEY=your-secret-access-key
   AWS_REGION=us-east-1
   AWS_BUCKET_NAME=cis-7000-usd-assets


### Django
   To start the server, you must first make migrations.
   ```bash
   python asset_library/manage.py migrate
   ````

   Then, you can start the server.

   ```bash
   python asset_library/manage.py runserver
   ```

### Env
See the discord channel for the secret keys for S3 and the deployed MySQL.

### Current Contributors:
**Aaron Jiang**: *aajiang@seas.upenn.edu* \
**Cindy Xu**: *cxndy@seas.upenn.edu* \
**Jacky Park**: *soominp@seas.upenn.edu* \
**Amy Liu**: *liuamy05@sas.upenn.edu*

### The End!
If you run into any issues during setup, please let us know. The more bugs we fix, systems we adjust to, and documentation we can add, the better. Thanks!