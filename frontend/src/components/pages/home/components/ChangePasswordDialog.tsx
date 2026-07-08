import React from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useFrappePostCall } from "frappe-react-hooks"
import { useEffect } from "react"
import FormInput from "@/components/common/form-components/FormInput"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AUTH_METHODS } from "@/components/common/consts/methods.consts"
import { frappeErrorHandler } from "@/lib/general_utils"
import type { UseDisclosureProps } from "@/components/hooks/useDisclosure"

interface ForgotPasswordDialogProps {
  disclosure:UseDisclosureProps
}

export default function ForgotPasswordDialog({disclosure,}: ForgotPasswordDialogProps) {
  const { call: submitForgotPassword, loading: apiLoading } = useFrappePostCall(
    AUTH_METHODS.FORGOT_PASSWORD
  )

  const formik = useFormik({
    initialValues: {
      user: "",
    },
    validationSchema: Yup.object({
      user: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      toast.promise(submitForgotPassword(values), {
        loading: "Submitting request...",
        error: (error: any) => {
          return frappeErrorHandler(error) || "An error occurred"
        },
        success() {
          disclosure.onClose()
          formik.resetForm()
          return "We have sent a password reset link to your email address."
        },
      })
    },
  })

  useEffect(() => {
    if (!disclosure.isOpen) {
      formik.resetForm()
    }
  }, [disclosure.isOpen])

  return (
    <Dialog open={disclosure.isOpen} onOpenChange={disclosure.onClose}>
      <DialogContent className="min-w-125">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your email to get instructions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
          <div className="w-full space-y-1.5">
            <FormInput
              id="dialog-email"
              label="Email"
              isRequired={true}
              placeholder="name@example.com"
              name="user"
              formik={formik}
              type="text"
              className="bg-background"
              isDisabled={apiLoading}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => disclosure.onClose()}
              className="py-2 text-muted-foreground transition-colors outline-none hover:text-slate-900"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-[#007A9B] font-medium text-white hover:bg-[#006682]"
              disabled={apiLoading}
            >
              {apiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
