"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { signIn as nextAuthSignin } from "next-auth/react";

const signInSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SigninForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);

  const onSubmit = async (data: SignInFormValues) => {
    try {
      const { username, password } = data;
      await signIn(username, password);
      toast.success("Đăng nhập thành công!");
      router.push("/");
      // eslint-disable-next-line
    } catch (error: any) {
      toast.error(
        error.response?.data.message || "Đăng nhập thất bại. Vui lòng thử lại.",
      );
    }
  };
  const handleGoogleLogin = () => {
    nextAuthSignin("google", { callbackUrl: "/" });
  };

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* header - logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <Link href="/" className="mx-auto block w-fit text-center">
                  <Image
                    src="/logo.png"
                    alt="logo"
                    width={60}
                    height={60}
                    loading="eager"
                  />
                </Link>

                {/* <h1 className="text-2xl font-bold">
                  Đăng nhập để bắt đầu trò chuyện
                </h1> */}
                <p className="text-muted-foreground text-balance">
                  Đăng nhập để bắt đầu trò chuyện
                </p>
              </div>
              {/* username */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="username" className="block text-sm">
                  Tên đăng nhập
                </Label>
                <Input
                  type="text"
                  id="username"
                  placeholder="username"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-destructive text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>
              {/* password */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className="block text-sm">
                  Mật khẩu
                </Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* nút đăng nhập */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Đăng nhập
              </Button>
              <span className="text-center text-sm">or</span>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isSubmitting}
                onClick={handleGoogleLogin}
              >
                <Image
                  src="/google.png"
                  alt="google"
                  className="pr-1"
                  width={20}
                  height={20}
                />
                Đăng nhập với Google
              </Button>
              <div className="text-center text-sm mt-9">
                Chưa có tài khoản?{" "}
                <a href="/signup" className="underline underline-offset-4">
                  Đăng ký
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted hidden md:block">
            <Image
              src="/placeholder-signin.png"
              alt="Image"
              className="object-cover"
              width={500}
              height={700}
            />
          </div>
        </CardContent>
      </Card>
      <div className=" text-xs text-balance px-6 text-center *:[a]:hover:text-primary text-muted-foreground *:[a]:underline *:[a]:underline-offetset-4">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và{" "}
        <a href="#">Chính sách bảo mật</a> của chúng tôi.
      </div>
    </div>
  );
}
