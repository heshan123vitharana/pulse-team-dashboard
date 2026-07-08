import React from "react"
import LoginArt from "../../../assets/cams-login-image.png"
import Logo from "@/components/common/Logo"
import LoginForm from "./components/LoginForm"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between border-r border-slate-100 bg-slate-50 px-10 pt-10 pb-5 lg:flex">
        <div className="max-w-[520px] space-y-4">
          <div className="flex items-center gap-3">
            <Logo labelClassName="text-slate-800" />
          </div>
          <div className="space-y-1 pt-6">
            <h1 className="text-2xl leading-snug font-bold tracking-tight text-slate-900 uppercase">
              Sri Lanka Institute of Development Administration
            </h1>
            <p className="text-justify text-sm leading-relaxed font-normal text-slate-600">
              Premier public sector training organization in Sri Lanka, for the
              development of knowledge and improvement of skills in Public
              Administration and Management.
            </p>
          </div>
        </div>

        <div className="flex max-h-[60vh] flex-1 items-center justify-center px-6">
          <img
            src={LoginArt}
            alt="CAMS System Vectors"
            className="h-full w-auto object-contain mix-blend-multiply"
          />
        </div>

        <div className="text-xs tracking-wide text-muted-foreground">
          © 2026 DLAD Software Solution. All rights reserved.
        </div>
      </div>

      <div className="flex flex-col justify-between p-6 md:p-10">
        <div className="flex justify-center lg:hidden">
          <div className="flex flex-col items-center gap-2">
            <Logo labelClassName="text-slate-800" />
            <span className="max-w-[280px] text-center text-xs font-bold text-muted-foreground">
              Sri Lanka Institute of Development Administration
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
          © 2026 DLAD Software Solution
        </div>
      </div>
    </div>
  )
}
