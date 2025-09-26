import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { setAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Loader2, Building } from "lucide-react";

const ENABLE_DEMO = import.meta.env.VITE_ENABLE_DEMO_LOGIN === "true";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Optional demo mode (UI-only). Disabled unless VITE_ENABLE_DEMO_LOGIN === 'true'.
      if (
        ENABLE_DEMO &&
        data.email === "admin@company.com" &&
        data.password === "password"
      ) {
        const mockUser = {
          id: "1",
          email: "admin@company.com",
          firstName: "Admin",
          lastName: "User",
          role: "Administrator",
        };
        const mockToken = "demo-jwt-token-" + Date.now();
        setAuth(mockToken, mockUser);
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        });
        navigate("/", { replace: true });
        return;
      }

      // Try real API call for other credentials
      const response = await api.post("/auth/login", data);
      const { token, user } = response.data;
      // Normalize backend user shape to frontend expectation
      const normalizedUser = {
        id: user.id || user._id,
        email: user.email,
        firstName: user.first_name ?? user.firstName ?? "",
        lastName: user.last_name ?? user.lastName ?? "",
        role: user.role,
      };
      setAuth(token, normalizedUser);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      navigate("/", { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Login failed",
        description:
          err.response?.data?.message ||
          "Please use demo credentials: admin@company.com / password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card className="glass-card animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-lg bg-primary/10">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to EMS</CardTitle>
            <CardDescription>
              Sign in to your Employee Management System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm font-medium text-accent mb-1">Admin User</p>
              <p className="text-xs text-muted-foreground mb-2">
                Use these credentials to login from the admin user:
              </p>
              <div className="space-y-1 text-xs">
                <div>
                  <strong>Email:</strong> admin@example.com
                </div>
                <div>
                  <strong>Password:</strong> Admin@12345
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
