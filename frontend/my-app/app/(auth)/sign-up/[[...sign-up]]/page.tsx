import { SignUp } from '@clerk/nextjs'
import React from 'react'

function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-left-anothertopbar to-right-anothertopbar flex flex-col">
          <main className="flex-1 flex justify-center items-center p-4">
            <SignUp />
          </main>
        </div>
  )
}

export default SignUpPage