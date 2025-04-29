import { Skeleton } from "@/components/ui/skeleton";
import { getAccessToken } from "@/utils/utils";
import { actions } from "astro:actions";
import { UserIcon } from "lucide-react";
import { useEffect, useState } from "react";

type UserProps = {
  name: string;
  pennKey: string;
};

const Account = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProps | null>(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      const result = await getAccessToken();

      if (!result.success) {
        setUser(null);
        return;
      }

      const { data, error } = await actions.getMe({ accessToken: result.accessToken });

      if (error) {
        setUser(null);
        return;
      }

      setUser({ name: `${data.firstName} ${data.lastName}`, pennKey: data.pennkey });
    }

    fetchCurrentUser();
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <Skeleton className="h-8 rounded-xl w-[200px]" />;
  }

  return (
    <>
      {user ? (
        <div className="flex flex-col items-end">
          <p>
            Logged in as{" "}
            <span className="font-semibold">
              {user.name} ({user.pennKey})
            </span>
          </p>
          <a
            href={`/user/${user.pennKey}`}
            className="text-sm gap-0.5 text-muted-foreground flex items-center hover:underline underline-offset-2 transition-colors hover:text-foreground"
          >
            <UserIcon size={14} strokeWidth={2.5} />
            View profile
          </a>
        </div>
      ) : (
        <p>
          Currently signed out.{" "}
          <a href="/login" className="font-semibold hover:underline underline-offset-4">
            Login here.
          </a>
        </p>
      )}
    </>
  );
};

const Header = () => {
  return (
    <header className="flex justify-between items-center">
      <h1 className="text-3xl font-bold mb-2 text-left -translate-x-2">
        <a href="/" className="hover:opacity-60 transition-opacity font-extrabold opacity-100">
          🍓Papaya
        </a>
      </h1>

      <Account />
    </header>
  );
};

export { Header };
