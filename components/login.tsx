"use client";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Key, Lock } from "lucide-react";
import { setCookie } from "nookies";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (username === "admin" && password === "admin123") {
        const token = "secure-auth-token";
        setCookie(null, "auth-token", token, {
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: "/",
        });
        router.push("/customers");
      } else {
        setError("Invalid username or password");
        setIsLoading(false);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <div className="flex justify-center xl:mt-12 mt-auto mb-auto">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-col gap-2 items-center justify-center pt-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Admin Login</h1>
        </CardHeader>

        <CardBody className="gap-4 px-6">
          <Input
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            startContent={<Key className="w-4 h-4 text-gray-400" />}
            isRequired
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            startContent={<Lock className="w-4 h-4 text-gray-400" />}
            isRequired
          />

          {error && (
            <div className="px-3 py-2 bg-danger-50 text-danger text-sm rounded-lg">
              {error}
            </div>
          )}
        </CardBody>

        <CardFooter className="px-6 pb-8 pt-2">
          <div className="w-full space-y-4">
            <Button
              color="primary"
              fullWidth
              size="lg"
              onPress={handleLogin}
              isLoading={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <Button
              color="secondary"
              fullWidth
              size="lg"
              onPress={handleInstallClick}
            >
              Install App
            </Button>

            <p className="text-center text-sm text-gray-500">
              Forgot your password? Contact administrator
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
