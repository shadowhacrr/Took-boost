import { useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Sparkles, Phone } from 'lucide-react'
import { toast } from 'sonner'

export default function OwnerLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.owner.login(username, password)
      if (res.success && res.token) {
        localStorage.setItem('tokboost_token', res.token)
        toast.success('Welcome Owner!')
        navigate('/owner')
      } else {
        toast.error(res.message || 'Login failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-tiktok-dark flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#25F4EE] opacity-10 animate-float" />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-[#FE2C55] opacity-10 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-[#25F4EE] opacity-5 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#25F4EE] to-[#FE2C55] mb-4 animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Tok<span className="text-[#25F4EE]">Boost</span>
          </h1>
          <p className="text-gray-400">Owner Panel</p>
        </div>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a] glow-cyan animate-fade-in">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#25F4EE]" />
              Owner Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label className="text-gray-300">Username</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter owner username"
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
                className="w-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] hover:opacity-90 text-white font-semibold"
              >
                <Lock className="w-4 h-4 mr-2" />
                {loading ? 'Logging in...' : 'Login to Owner Panel'}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-4">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#25F4EE] hover:text-[#FE2C55] transition-colors"
              >
                <Phone className="w-4 h-4" />
                WhatsApp Support
              </a>
              <a href="/complaint" className="flex items-center gap-2 text-sm text-[#FE2C55] hover:text-[#25F4EE] transition-colors">
                <Shield className="w-4 h-4" />
                Complaint
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <a href="/admin-login" className="text-sm text-gray-500 hover:text-[#25F4EE] transition-colors">
            Admin Login &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}
