import { useState } from 'react'
import { useNavigate } from 'react-router'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, MessageSquare, Send, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ComplaintPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.complaints.create({ name, email, message })
      setSubmitted(true)
      toast.success('Complaint submitted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-tiktok-dark flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-[#FE2C55] opacity-10 animate-float" />
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-[#25F4EE] opacity-10 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg px-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        <Card className="bg-[#0a0a0a] border-[#1a1a1a] animate-fade-in">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#FE2C55]" /> Submit Complaint
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">Complaint Submitted!</h3>
                <p className="text-gray-400 mt-2">We will review your complaint and get back to you soon.</p>
                <Button onClick={() => navigate('/')} className="mt-4 bg-[#25F4EE] text-black">
                  Go Home
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Your Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-[#111] border-[#222] text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-[#111] border-[#222] text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Complaint Message</Label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="bg-[#111] border-[#222] text-white min-h-[120px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FE2C55] text-white hover:opacity-90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
