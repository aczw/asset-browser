import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/use-toast";
import { actions } from "astro:actions";

export default function LoginPage() {
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const { data, error } = await actions.storeLoginTokens(formData);

    if (!error) {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      window.location.href = "/";
    } else {
      toast({
        title: "Invalid Credentials",
        description: "Username is your PennKey, password is 'password'",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-svh items-center justify-center p-6 md:p-10 gap-10 min-w-svw">
      <h1 className="text-3xl font-bold mb-2 text-left -translate-x-3">
        <a href="/" className="hover:text-muted-foreground transition-colors font-extrabold ">
          🍓Papaya
        </a>
      </h1>

      <Card className="space-y-5 min-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl mt-6">Login</CardTitle>
          <CardDescription>Enter your PennKey below to login to your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">PennKey</Label>
                <Input id="username" name="username" type="text" required />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
            <div className="mt-4 text-center text-sm mb-6">
              Don't have an account? Contact an admin.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
