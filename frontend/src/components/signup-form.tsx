"use client";
import { cn, formatTime } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRef, useState } from "react";

const userInfoSchema = z.object({
  firstname: z.string().min(1, "Tên bắt buộc phải có"),
  lastname: z.string().min(1, "Họ bắt buộc phải có"),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
const otpSchema = z.object({
  otp: z.string().min(1, "OTP là bắt buộc"),
});

type userInfoFormValues = z.infer<typeof userInfoSchema>;
type otpFormValues = z.infer<typeof otpSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { signUp, sendOtp } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<userInfoFormValues>({
    resolver: zodResolver(userInfoSchema),
  });

  const otpForm = useForm<otpFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const [userInfo, setUserInfo] = useState<userInfoFormValues>({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
  });
  const [isShowOtp, setIsShowOtp] = useState(false);
  const [countdown, setCountdown] = useState(0); // số giây còn lại
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  const onGenerateOtp = async (data: userInfoFormValues) => {
    try {
      const { firstname, lastname, username, email, password } = data;
      const { expiresAt } = await sendOtp(
        firstname,
        lastname,
        username,
        email,
        password,
      );
      setUserInfo(data);
      setIsShowOtp(true);

      if (expiresAt) {
        showCoutdown(expiresAt);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Đăng ký thất bại. Vui lòng thử lại.",
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      const { firstname, lastname, username, email, password } = userInfo;
      const { expiresAt } = await sendOtp(
        firstname,
        lastname,
        username,
        email,
        password,
      );

      if (expiresAt) {
        showCoutdown(expiresAt);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Đăng ký thất bại. Vui lòng thử lại.",
      );
    }
  };
  const showCoutdown = (expiresAt: string) => {
    const now = Date.now();
    const secondsLeft = Math.floor((+expiresAt - now) / 1000);
    if (secondsLeft > 0) {
      setCountdown(secondsLeft);
      setCanResend(false);
      startCountdown(secondsLeft);
    }
  };
  const startCountdown = (initialSeconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    let seconds = initialSeconds;
    timerRef.current = setInterval(() => {
      seconds -= 1;
      setCountdown(seconds);
      if (seconds <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setCountdown(0);
        setCanResend(true);
      }
    }, 1000) as any;
  };

  const onSubmitOtpAllInfo = async (otpdata: otpFormValues) => {
    try {
      const { otp } = otpdata;
      const { firstname, lastname, username, email, password } = userInfo;
      await signUp(firstname, lastname, username, email, password, otp);
      toast.success("Đăng ký thành công!");
      router.push("/signin");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Đăng ký thất bại. Vui lòng thử lại.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 p-0">
      {!isShowOtp && (
        <Card className="overflow-hidden p-0 border-border">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={handleSubmit(onGenerateOtp)}>
              <div className="flex flex-col gap-6">
                {/* header - logo */}
                <div className="flex flex-col items-center text-center gap-2">
                  <Link href="/" className="mx-auto block w-fit text-center">
                    <Image
                      src="/message-icon.png"
                      alt="logo"
                      width={60}
                      height={60}
                    />
                  </Link>

                  <h1 className="text-2xl font-bold">
                    Tạo tài khoản QuickChat
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    Chào mừng bạn! Hãy đăng ký để bắt đầu!
                  </p>
                </div>
                {/* Nhập thông tin user */}

                <div className="flex flex-col gap-6">
                  {/* họ & tên */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="lastname" className="block text-sm">
                        Họ
                      </Label>
                      <Input
                        type="text"
                        id="lastname"
                        {...register("lastname")}
                      />

                      {errors.lastname && (
                        <p className="text-destructive text-sm">
                          {errors.lastname.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fistname" className="block text-sm">
                        Tên
                      </Label>
                      <Input
                        type="text"
                        id="firstname"
                        {...register("firstname")}
                      />
                      {errors.firstname && (
                        <p className="text-destructive text-sm">
                          {errors.firstname.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* username */}
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="username" className="block text-sm">
                      Tên đăng nhập
                    </Label>
                    <Input
                      type="text"
                      id="username"
                      {...register("username")}
                    />
                    {errors.username && (
                      <p className="text-destructive text-sm">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* email */}
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="email" className="block text-sm">
                      Email
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="example@gmail.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm">
                        {errors.email.message}
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
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-destructive text-sm">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* nút đăng ký */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    Tạo tài khoản
                  </Button>

                  <div className="text-center text-sm">
                    Đã có tài khoản?{" "}
                    <a href="/signin" className="underline underline-offset-4">
                      Đăng nhập
                    </a>
                  </div>
                </div>
              </div>
            </form>
            <div className="bg-muted hidden md:block">
              <Image
                src="/placeholder-signin.png"
                alt="Image"
                className="object-contain bg-background"
                width={500}
                height={700}
                loading="eager"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {isShowOtp && (
        <Card className="overflow-hidden p-0 border-border w-sm m-auto md:w-xl">
          <CardContent className="grid p-6 grid-cols-1">
            <h1 className="text-center font-bold font-heading text-2xl">
              Xác Thực OTP
            </h1>
            <p className="text-center mt-2 text-status-offline">
              Vui lòng nhập mã xác thực đã gửi tới email của bạn:
            </p>
            <span className="text-center text-primary font-semibold">
              {userInfo.email}
            </span>
            <hr className="border-t border-gray-300 my-4 w-5/6 m-auto" />

            <form
              className="p-6 md:p-8"
              onSubmit={otpForm.handleSubmit(onSubmitOtpAllInfo)}
            >
              <div className="flex flex-col gap-6">
                {/* Nhập OTP */}
                {isShowOtp && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-3 align-middle">
                      <Input
                        type="text"
                        id="otp"
                        placeholder="OTP"
                        {...otpForm.register("otp")}
                        className="w-96"
                        disabled={canResend}
                      />
                      {otpForm.formState.errors.otp && (
                        <p className="text-destructive text-sm w-96">
                          {otpForm.formState.errors.otp.message}
                        </p>
                      )}
                    </div>
                    {countdown > 0 && (
                      <span className="text-center text-gray-600">
                        Thời gian còn lại để nhập OTP:
                        <span> </span>
                        <span className="font-bold">
                          {formatTime(countdown)}
                        </span>
                      </span>
                    )}

                    <hr className="border-t border-gray-300 my-4 w-1/2 m-auto" />

                    {/* nút đăng ký */}
                    <Button
                      type="submit"
                      className="w-24 m-auto"
                      disabled={canResend}
                    >
                      Xác nhận
                    </Button>

                    <div className="m-auto text-status-offline">
                      Không nhận được mã?
                      <Link
                        href="#"
                        style={{
                          pointerEvents: canResend ? "auto" : "none",
                        }}
                        onClick={handleResendOtp}
                        className={cn(
                          "underline",
                          canResend ? "text-primary" : "text-gray-400",
                        )}
                      >
                        Gửi lại Otp
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
