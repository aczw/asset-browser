import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GetUsersBody } from "@/lib/types";
import { LogInIcon, User, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";

type UserProps = {
  name: string;
  pennKey: string;
};

const Header = ({ users }: { users: GetUsersBody["users"] }) => {
  const [user, setUser] = useState<UserProps | null>(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      // TODO
      // setUser({ name: "Charles Wang", pennKey: "czw" });
    }

    fetchCurrentUser();
  }, []);

  return (
    <header className="flex justify-between items-center">
      <h1 className="text-3xl font-bold mb-2 text-left -translate-x-2">
        <a href="/" className="hover:text-muted-foreground transition-colors font-extrabold">
          🍓Papaya
        </a>
      </h1>

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
    </header>
  );
};

export { Header };
