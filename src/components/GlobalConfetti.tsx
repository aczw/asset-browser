import { getAccessToken } from "@/utils/utils";
import { actions } from "astro:actions";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

type UserProps = {
  name: string;
  pennKey: string;
};

const GlobalConfetti = () => {
  const [user, setUser] = useState<UserProps | null>(null);
  const { width, height } = useWindowSize();

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
  }, []);

  if (user?.pennKey === "rhallac") {
    return (
      <Confetti
        width={width}
        height={height}
        numberOfPieces={200}
        recycle={false}
        gravity={5}
        initialVelocityY={50}
        tweenDuration={1000}
      />
    );
  }

  return null;
};

export { GlobalConfetti };
