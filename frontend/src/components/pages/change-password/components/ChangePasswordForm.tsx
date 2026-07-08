import FormInput from "@/components/common/form-components/FormInput.tsx"
import { Button } from "@/components/ui/button.tsx"
import { cn } from "@/lib/utils.ts"
import { useFormik } from "formik"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import * as Yup from "yup"
import { useLoading } from "@/components/hooks/useLoading.tsx"
import { frappeErrorHandler } from "@/lib/general_utils"
import { useFrappePostCall } from "frappe-react-hooks"
import { AUTH_METHODS } from "@/components/common/consts/methods.consts"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ChangePasswordForm = ({
  className,
  ...props
}: UserAuthFormProps) => {
  const navigate = useNavigate()
  const { key } = useParams()
  const { isLoading, hideLoading, showLoading } = useLoading()
  const [showPwd, setShowPwd] = useState(false)
  const [showCpwd, setShowCpwd] = useState(false)

  const { call } = useFrappePostCall(AUTH_METHODS.CHANGE_PASSWORD)

  const formik = useFormik({
    initialValues: {
      pwd: "",
      confirm_pwd: "",
    },
    validationSchema: Yup.object({
      pwd: Yup.string().required("Password is required"),
      confirm_pwd: Yup.string()
        .required("Password is required")
        .oneOf([Yup.ref("pwd"), ""], "Passwords must match"),
    }),
    onSubmit: async (values) => {
      showLoading()
      toast.promise(
        call({
          new_pwd: values.confirm_pwd,
          key: key,
        }),
        {
          loading: "Changing Password...",
          error: (error: Error) => {
            return frappeErrorHandler(error)
          },
          success() {
            navigate("/")
            return "Your password has been successfully changed."
          },
          finally() {
            hideLoading()
          },
        }
      )
    },
  })

  const showPwdHideHandleClick = () => setShowPwd(!showPwd)
  const showCpwdHideHandleClick = () => setShowCpwd(!showCpwd)

  const loginFormMarkup = (
    <div className="flex w-full flex-col gap-6">
                  
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Change Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password
        </p>
      </div>
                      
      <div className={cn("grid gap-6", className)} {...props}>
                            
        <form onSubmit={formik.handleSubmit} className="grid gap-4">
                                  
          <div className="grid gap-5">
                                        
            <div className="relative">
                                              
              <FormInput
                label="Password"
                isRequired={true}
                placeholder="*****"
                name="pwd"
                formik={formik}
                type={showPwd ? "text" : "password"}
                isDisabled={isLoading}
              />
                                          
            </div>
                                        
            <div className="relative">
                                              
              <FormInput
                label="Confirm Password"
                isRequired={true}
                placeholder="*****"
                name="confirm_pwd"
                formik={formik}
                type={showCpwd ? "text" : "password"}
                isDisabled={isLoading}
              />
                                          
            </div>
                                    
          </div>
                                  
          <Button type="submit" disabled={isLoading}>
                                        
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Change Password                         
          </Button>
                              
        </form>
                        
      </div>
                  
    </div>
  )

  return (
    <>
                  
      <div className="animation-form-l3" key={2}>
                        {loginFormMarkup}
                    
      </div>
              
    </>
  )
}
