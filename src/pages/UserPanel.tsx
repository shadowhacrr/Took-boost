import { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Music, User, Hash, CreditCard, Upload, Send, CheckCircle, Clock,
  Star, Phone, MessageSquare, ArrowRight, Package, DollarSign, Shield
} from 'lucide-react'

export default function UserPanel() {
  const { link } = useParams<{ link: string }>()
  const [admin, setAdmin] = useState<any>(null)
  const [pricing, setPricing] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Order form
  const [tiktokUsername, setTiktokUsername] = useState('')
  const [service, setService] = useState('followers')
  const [quantity, setQuantity] = useState(100)
  const [transactionId, setTransactionId] = useState('')
  const [paymentScreenshot, setPaymentScreenshot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [placedOrder, setPlacedOrder] = useState<any>(null)
  const [orderStatus, setOrderStatus] = useState<string>('pending')

  // Review form
  const [showReview, setShowReview] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [a, p] = await Promise.all([
          api.public.adminByLink(link!),
          api.pricing.get(),
        ])
        setAdmin(a)
        setPricing(p)
      } catch (err: any) {
        toast.error(err.message || 'Invalid admin link')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [link])

  // Poll order status
  useEffect(() => {
    if (!placedOrder) return
    const interval = setInterval(async () => {
      try {
        const status = await api.orders.status(placedOrder.id)
        setOrderStatus(status.status)
        if (status.status === 'completed') {
          setShowReview(true)
        }
      } catch { /* ignore */ }
    }, 3000)
    return () => clearInterval(interval)
  }, [placedOrder])

  const calculatePrice = () => {
    if (!pricing) return 0
    const perUnit = pricing[service] || 0
    return quantity * perUnit
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPaymentScreenshot(reader.result as string)
      toast.success('Screenshot uploaded')
    }
    reader.readAsDataURL(file)
  }

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tiktokUsername.trim()) return toast.error('Enter TikTok username')
    if (!transactionId.trim()) return toast.error('Enter transaction ID')
    if (!paymentScreenshot) return toast.error('Upload payment screenshot')
    setSubmitting(true)
    try {
      const res = await api.orders.create({
        adminLink: link!,
        tiktokUsername: tiktokUsername.trim(),
        service,
        quantity,
        totalPrice: calculatePrice(),
        transactionId: transactionId.trim(),
        paymentScreenshot,
      })
      if (res.success && res.order) {
        toast.success('Order placed! Please wait...')
        setPlacedOrder(res.order)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  const submitReview = async () => {
    if (!admin) return
    try {
      await api.reviews.create({ adminId: admin.id, rating, comment: reviewComment })
      toast.success('Thank you for your review!')
      setReviewSubmitted(true)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-tiktok-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25F4EE]" />
      </div>
    )
  }

  if (!admin || !pricing) {
    return (
      <div className="min-h-screen bg-tiktok-dark flex items-center justify-center text-white">
        <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Invalid Link</h2>
            <p className="text-gray-400 mt-2">This admin panel link is invalid or expired.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tiktok-dark text-white">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-6 h-6 text-[#25F4EE]" />
            <h1 className="text-xl font-bold">
              Tok<span className="text-[#25F4EE]">Boost</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] text-sm hover:bg-[#25D366]/20 transition">
              <Phone className="w-3 h-3" /> Support
            </a>
            <a href="/complaint" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FE2C55]/10 text-[#FE2C55] text-sm hover:bg-[#FE2C55]/20 transition">
              <MessageSquare className="w-3 h-3" /> Complaint
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Admin Info */}
        <Card className="bg-[#0a0a0a] border-[#1a1a1a] mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25F4EE] to-[#FE2C55] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">@{admin.username}</p>
                <p className="text-xs text-gray-400">Official Reseller</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {placedOrder ? (
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-[#25F4EE]" /> Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                {orderStatus === 'pending' && (
                  <>
                    <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-3 animate-pulse" />
                    <h3 className="text-lg font-bold text-yellow-500">Please Wait</h3>
                    <p className="text-gray-400">Soon your order will be placed</p>
                  </>
                )}
                {orderStatus === 'completed' && (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-green-500">Order Complete!</h3>
                    <p className="text-gray-400">Your {placedOrder.service} order has been delivered</p>
                  </>
                )}
              </div>

              <div className="p-3 rounded-lg bg-[#111] border border-[#1a1a1a]">
                <p className="text-sm text-gray-400">TikTok Username: <span className="text-white font-semibold">@{placedOrder.tiktokUsername}</span></p>
                <p className="text-sm text-gray-400">Service: <span className="text-white font-semibold capitalize">{placedOrder.service}</span></p>
                <p className="text-sm text-gray-400">Quantity: <span className="text-white font-semibold">{placedOrder.quantity}</span></p>
                <p className="text-sm text-gray-400">Total Paid: <span className="text-[#25F4EE] font-semibold">Rs. {placedOrder.totalPrice}</span></p>
              </div>

              {/* Review Section */}
              {showReview && !reviewSubmitted && (
                <div className="p-4 rounded-lg bg-[#111] border border-[#1a1a1a]">
                  <h4 className="font-semibold text-white mb-2">Rate Your Experience</h4>
                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)}>
                        <Star className={`w-6 h-6 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your review..."
                    className="w-full p-3 rounded-lg bg-[#0a0a0a] border border-[#222] text-white text-sm mb-2"
                    rows={3}
                  />
                  <Button onClick={submitReview} className="bg-[#25F4EE] text-black hover:opacity-90">
                    <Send className="w-4 h-4 mr-1" /> Submit Review
                  </Button>
                </div>
              )}
              {reviewSubmitted && (
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-500">Thank you for your review!</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Order Form */}
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-[#FE2C55]" /> Place Your Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitOrder} className="space-y-4">
                  <div>
                    <Label className="text-gray-300 flex items-center gap-1">
                      <User className="w-4 h-4 text-[#25F4EE]" /> TikTok Username
                    </Label>
                    <Input
                      value={tiktokUsername}
                      onChange={(e) => setTiktokUsername(e.target.value)}
                      placeholder="Enter your TikTok username (without @)"
                      className="bg-[#111] border-[#222] text-white mt-1"
                      required
                    />
                    <p className="text-xs text-[#FE2C55] mt-1">Careful! Order will be delivered to this username.</p>
                  </div>

                  <div>
                    <Label className="text-gray-300 flex items-center gap-1">
                      <Package className="w-4 h-4 text-[#25F4EE]" /> Select Service
                    </Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {Object.keys(pricing).map((svc) => (
                        <button
                          key={svc}
                          type="button"
                          onClick={() => setService(svc)}
                          className={`p-3 rounded-lg border text-sm font-medium transition ${
                            service === svc
                              ? 'border-[#25F4EE] bg-[#25F4EE]/10 text-[#25F4EE]'
                              : 'border-[#222] bg-[#111] text-gray-400 hover:border-[#333]'
                          }`}
                        >
                          <span className="capitalize">{svc}</span>
                          <p className="text-xs mt-1 opacity-70">Rs. {pricing[svc]}/unit</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300 flex items-center gap-1">
                      <Hash className="w-4 h-4 text-[#25F4EE]" /> Quantity
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                      className="bg-[#111] border-[#222] text-white mt-1"
                      required
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-[#25F4EE]/10 to-[#FE2C55]/10 border border-[#25F4EE]/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-[#25F4EE]" />
                        <span className="text-gray-300">Total Price</span>
                      </div>
                      <span className="text-2xl font-bold text-white">Rs. {calculatePrice()}</span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="p-4 rounded-lg bg-[#111] border border-[#1a1a1a]">
                    <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#FE2C55]" /> Payment Details
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">
                        Wallet: <Badge className={admin.walletType === 'easypaisa' ? 'bg-[#25F4EE]/20 text-[#25F4EE]' : 'bg-[#FE2C55]/20 text-[#FE2C55]'}>{admin.walletType || 'Not set'}</Badge>
                      </p>
                      <p className="text-sm text-gray-400">Account Name: <span className="text-white">{admin.walletName || 'Not set'}</span></p>
                      <p className="text-sm text-gray-400">Account Number: <span className="text-[#25F4EE] font-mono">{admin.walletNumber || 'Not set'}</span></p>
                    </div>
                    <p className="text-xs text-[#FE2C55] mt-2">Send payment to this account and upload proof below.</p>
                  </div>

                  <div>
                    <Label className="text-gray-300">Transaction ID</Label>
                    <Input
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter payment transaction ID"
                      className="bg-[#111] border-[#222] text-white mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Payment Screenshot</Label>
                    <div className="mt-1">
                      <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-[#333] rounded-lg cursor-pointer hover:border-[#25F4EE] transition">
                        <div className="flex flex-col items-center text-gray-400">
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-sm">{paymentScreenshot ? 'Change Screenshot' : 'Upload Screenshot'}</span>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                      {paymentScreenshot && (
                        <img src={paymentScreenshot} alt="Payment" className="mt-2 max-w-[200px] rounded border border-[#222]" />
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] hover:opacity-90 text-white font-bold py-6"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
