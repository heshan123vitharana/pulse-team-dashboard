import FormInput from "@/components/common/form-components/FormInput.tsx"
import { useLoading } from "@/components/hooks/useLoading"
import { Button } from "@/components/ui/button.tsx"
import { cn } from "@/lib/utils.ts"
import { Label } from "@radix-ui/react-label"
import { useLocalStorage } from "@uidotdev/usehooks"
import { useFormik } from "formik"
import {
  keyInvalidator,
  useFrappeAuth,
  useFrappePostCall,
} from "frappe-react-hooks"
import { Loader2 } from "lucide-react"
import React from "react"
import { toast } from "sonner"
import * as Yup from "yup"
import { AUTH_METHODS } from "@/components/common/consts/methods.consts"
import { frappeErrorHandler } from "@/lib/general_utils"
import { useState,useEffect } from "react"
import { useNavigate,useLocation } from "react-router-dom"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

  const LoginForm = ({ className, ...props }: UserAuthFormProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useFrappeAuth()
  const [storeValue, setStoreValue]: any = useLocalStorage("organization_details","")
  const { isLoading, hideLoading, showLoading } = useLoading()
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const { call: submitForgotPassword } = useFrappePostCall(AUTH_METHODS.FORGOT_PASSWORD)

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      showLoading()
      toast.promise(login(values), {
        loading: "Signing in...",
        error: (error: any) => {
          return frappeErrorHandler(error) || "An error occurred"
        },
        success() {
          navigate("/app")
          keyInvalidator(["SHADCN"])
          return "Logged in successfully"
        },
        finally() {
          hideLoading()
        },
      })
    },
  })

  useEffect(() => {
        if (location.state?.openForgotPwd) {
            setIsForgotPassword(true);
            
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

  const forgotPasswordFormik = useFormik({
    initialValues: {
      user: "",
    },
    validationSchema: Yup.object({
      user: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: async (values) => {
      showLoading()
      toast.promise(submitForgotPassword(values), {
        loading: "Submitting...",
        error: (error: any) => {
          return frappeErrorHandler(error) || "An error occurred"
        },
        success() {
          setIsForgotPassword(false)
          forgotPasswordFormik.resetForm()
          return "We have sent a password reset link to your email address."
        },
        finally() {
          hideLoading()
        },
      })
    },
  })

  const loginMarkup = (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Login to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials
        </p>
      </div>

      <div className={cn("grid gap-6", className)} {...props}>
        <form onSubmit={formik.handleSubmit} className="grid gap-5">
          <div className="grid gap-1">
            <div className="w-full space-y-1.5">
              <FormInput
                label="Email"
                isRequired={true}
                placeholder="name@example.com"
                name="username"
                formik={formik}
                type="text"
                className="bg-background"
                isDisabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-1">
            <div className="w-full space-y-1.5">
              <div className="flex w-full items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm leading-none font-medium"
                >
                  Password<span className="ml-0.5 text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="cursor-pointer text-sm font-normal text-muted-foreground underline-offset-4 opacity-50 outline-none hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <FormInput
                id="password"
                name="password"
                type="password"
                placeholder="*****"
                formik={formik}
                className="bg-background"
                isDisabled={isLoading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#007A9B] hover:bg-[#006682]"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login Now
          </Button>
        </form>
      </div>
    </div>
  )

  const forgotPasswordMarkup = (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Forgot password
        </h1>
        <p className="text-center text-sm text-balance text-muted-foreground">
          Enter your email address.
        </p>
      </div>
      <div className={cn("grid gap-6", className)} {...props}>
        <form
          onSubmit={forgotPasswordFormik.handleSubmit}
          className="grid gap-5"
        >
          <div className="grid gap-1">
            <div className="w-full space-y-1.5">
              <FormInput
                label="Email"
                isRequired={true}
                placeholder="name@example.com"
                name="user"
                formik={forgotPasswordFormik}
                type="text"
                className="bg-background"
                isDisabled={isLoading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#007A9B] hover:bg-[#006682]"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>

          <button
            type="button"
            onClick={() => setIsForgotPassword(false)}
            className="cursor-pointer py-2 text-center text-sm text-muted-foreground transition-colors outline-none hover:text-slate-900"
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  )

  if (isForgotPassword) {
    return forgotPasswordMarkup
  }

  return loginMarkup
}

export default LoginForm
