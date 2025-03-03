
import { SignIn } from '@clerk/nextjs'
import React from 'react'

function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-left-anothertopbar to-right-anothertopbar flex flex-col">
      <main className="flex-1 flex justify-center items-center p-4">
        <SignIn />
      </main>
    </div>
  )
}

export default SignInPage