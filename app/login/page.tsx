"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { motion } from "framer-motion"
import { AlertCircle, Loader2 } from "lucide-react"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const urlError = searchParams.get("error")

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const errorMessage = error || (urlError ? "Authentication failed. Please try again." : "")

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)
        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (res?.error) {
                setError("Invalid credentials. Please check your email and password.")
                setIsLoading(false)
            } else {
                router.push("/")
                router.refresh()
            }
        } catch (error) {
            setError("Something went wrong. Please try again later.")
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh] relative z-10 w-full px-4">
            <motion.div
                className="w-full max-w-[380px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <Card className="w-full bg-background/60 backdrop-blur-xl border-primary/20 shadow-2xl shadow-primary/5">
                    <CardHeader className="space-y-3 pb-6 border-b border-border/10 mb-6 mx-6 px-0 pt-6">
                        <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Welcome Back</CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">Enter your credentials to access your OS.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6">
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        placeholder="you@example.com"
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        className="bg-background/40 border-border/50 focus:border-primary/50 transition-colors h-11"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                                        <Link href="#" className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors" tabIndex={-1}>Forgot password?</Link>
                                    </div>
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        placeholder="••••••••"
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required
                                        className="bg-background/40 border-border/50 focus:border-primary/50 transition-colors h-11"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            
                            {errorMessage && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: "auto" }} 
                                    className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <p>{errorMessage}</p>
                                </motion.div>
                            )}

                            <Button className="w-full relative h-11 group shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <span className="relative z-10 flex items-center justify-center font-medium">
                                        Sign In
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center bg-muted/30 py-4 mt-2 rounded-b-xl border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account? <Link href="/signup" className="text-primary font-medium hover:underline transition-colors ml-1">Sign up</Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <LoginForm />
        </Suspense>
    )
}
