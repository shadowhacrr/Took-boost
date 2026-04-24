import { useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Lock, ArrowLeft, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.admin.login(username, password)
      if (res.success && res.token) {
        localStorage.setItem('tokboost_admin_token', res.token)
        toast.success('Welcome Admin!')
        navigate('/admin')
      } else {
        toast.error(res.message || 'Invalid credentials')
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-tiktok-dark flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#FE2C55] opacity-10 animate-float" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-[#25F4EE] opacity-10 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE] mb-4 animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Tok<span className="text-[#FE2C55]">Boost</span>
          </h1>
          <p className="text-gray-400">Admin Panel Login</p>
        </div>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a] glow-pink animate-fade-in">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#FE2C55]" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label className="text-gray-300">Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="bg-[#111] border-[#222] text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-300">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-[#111] border-[#222] text-white"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] hover:opacity-90 text-white font-semibold"
              >
                <Lock className="w-4 h-4 mr-2" />
                {loading ? 'Logging in...' : 'Login to Admin Panel'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-500 hover:text-[#25F4EE]">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Owner Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
