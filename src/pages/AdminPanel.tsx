import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Wallet, Link, CheckCircle, Clock, ArrowLeft, Phone, CreditCard,
  Copy, RefreshCw, Star, ShoppingBag, BarChart3
} from 'lucide-react'

export default function AdminPanel() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [walletType, setWalletType] = useState('easypaisa')
  const [walletNumber, setWalletNumber] = useState('')
  const [walletName, setWalletName] = useState('')
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [info, orderList, revList] = await Promise.all([
        api.admin.info(),
        api.admin.orders(),
        api.reviews.list(),
      ])
      setAdmin(info)
      setWalletType(info.walletType || 'easypaisa')
      setWalletNumber(info.walletNumber || '')
      setWalletName(info.walletName || '')
      setOrders(orderList.reverse())
      setReviews(revList.filter((r: any) => r.adminId === info.id))
    } catch (err: any) {
      toast.error(err.message || 'Session expired')
      if (err.message?.includes('Unauthorized')) {
        localStorage.removeItem('tokboost_admin_token')
        navigate('/admin-login')
      }
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const updateWallet = async () => {
    try {
      await api.admin.updateWallet({ walletType, walletNumber, walletName })
      toast.success('Wallet updated successfully')
      loadData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const refreshLink = async () => {
    try {
      const res = await api.admin.refreshLink()
      if (res.success) {
        toast.success('New user link generated!')
        loadData()
      }
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const completeOrder = async (orderId: string) => {
    try {
      await api.orders.complete(orderId)
      toast.success('Order marked as complete!')
      setShowCompleteModal(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const copyLink = () => {
    if (!admin) return
    const link = `${window.location.origin}/panel/${admin.userLink}`
    navigator.clipboard.writeText(link)
    toast.success('User panel link copied!')
  }

  const logout = () => {
    localStorage.removeItem('tokboost_admin_token')
    navigate('/admin-login')
  }

  const pendingOrders = orders.filter((o: any) => o.status === 'pending')
  const completedOrders = orders.filter((o: any) => o.status === 'completed')
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0)

  return (
    <div className="min-h-screen bg-tiktok-dark text-white">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5 text-[#FE2C55]" />
            </Button>
            <h1 className="text-xl font-bold">
              Tok<span className="text-[#25F4EE]">Boost</span>{' '}
              <span className="text-[#FE2C55]">Admin Panel</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition">
              <Phone className="w-4 h-4" /> Support
            </a>
            <Button variant="outline" size="sm" onClick={logout} className="border-[#FE2C55] text-[#FE2C55]">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-4 flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-[#25F4EE]" />
              <div>
                <p className="text-gray-400 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold">{completedOrders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-4 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-[#FE2C55]" />
              <div>
                <p className="text-gray-400 text-sm">Earnings (PKR)</p>
                <p className="text-2xl font-bold">{totalEarnings}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="bg-[#0a0a0a] border border-[#1a1a1a] mb-4 flex-wrap h-auto">
            <TabsTrigger value="orders" className="data-[state=active]:bg-[#FE2C55] data-[state=active]:text-white">
              <Clock className="w-4 h-4 mr-1" /> Orders
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-[#25F4EE] data-[state=active]:text-black">
              <Wallet className="w-4 h-4 mr-1" /> Wallet
            </TabsTrigger>
            <TabsTrigger value="link" className="data-[state=active]:bg-[#25F4EE] data-[state=active]:text-black">
              <Link className="w-4 h-4 mr-1" /> User Link
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-[#FE2C55] data-[state=active]:text-white">
              <Star className="w-4 h-4 mr-1" /> Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white">Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="p-4 rounded-lg bg-[#111] border border-[#1a1a1a]">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-white text-lg">@{order.tiktokUsername}</p>
                              <Badge className={order.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">{order.service} x {order.quantity}</p>
                            <p className="text-[#25F4EE] font-bold mt-1">Rs. {order.totalPrice}</p>
                            <p className="text-xs text-gray-600">TXN ID: {order.transactionId}</p>
                            <p className="text-xs text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
                            {order.paymentScreenshot && (
                              <img src={order.paymentScreenshot} alt="Payment" className="mt-2 max-w-[250px] rounded-lg border border-[#222]" />
                            )}
                          </div>
                          {order.status === 'pending' && (
                            <Button
                              onClick={() => setShowCompleteModal(order.id)}
                              className="bg-green-500 text-white hover:bg-green-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && <p className="text-gray-500 text-center py-8">No orders yet</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet">
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#25F4EE]" /> Wallet Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                <div>
                  <Label className="text-gray-300">Wallet Type</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      onClick={() => setWalletType('easypaisa')}
                      className={walletType === 'easypaisa' ? 'bg-[#25F4EE] text-black' : 'bg-[#111] text-gray-400'}
                    >
                      Easypaisa
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setWalletType('jazzcash')}
                      className={walletType === 'jazzcash' ? 'bg-[#FE2C55] text-white' : 'bg-[#111] text-gray-400'}
                    >
                      JazzCash
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Wallet Number</Label>
                  <Input
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="bg-[#111] border-[#222] text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Account Name</Label>
                  <Input
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    placeholder="Name on account"
                    className="bg-[#111] border-[#222] text-white"
                  />
                </div>
                <Button onClick={updateWallet} className="bg-[#25F4EE] text-black hover:opacity-90">
                  <Wallet className="w-4 h-4 mr-1" /> Save Wallet
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="link">
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white">User Panel Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400">Share this link with your customers. Anyone with this link can place orders without a password.</p>
                {admin && (
                  <div className="p-4 rounded-lg bg-[#111] border border-[#1a1a1a]">
                    <p className="text-sm text-gray-500 mb-2">Your unique user panel link:</p>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/panel/${admin.userLink}`}
                        className="bg-[#0a0a0a] border-[#222] text-[#25F4EE]"
                      />
                      <Button onClick={copyLink} className="bg-[#25F4EE] text-black">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <Button onClick={refreshLink} variant="outline" className="border-[#FE2C55] text-[#FE2C55]">
                  <RefreshCw className="w-4 h-4 mr-1" /> Generate New Link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white">Your Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-3 rounded-lg bg-[#111] border border-[#1a1a1a]">
                        <div className="flex items-center gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                          ))}
                        </div>
                        <p className="text-sm text-gray-300">{r.comment}</p>
                        <p className="text-xs text-gray-600 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                    {reviews.length === 0 && <p className="text-gray-500 text-center py-8">No reviews yet</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Complete Order Confirmation Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
          <Card className="bg-[#0a0a0a] border-[#1a1a1a] w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white">Complete Order?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-400">Are you sure you want to mark this order as complete? The customer will be notified.</p>
              <div className="flex gap-3">
                <Button onClick={() => setShowCompleteModal(null)} variant="outline" className="flex-1 border-gray-600">
                  Cancel
                </Button>
                <Button onClick={() => completeOrder(showCompleteModal)} className="flex-1 bg-green-500 text-white hover:bg-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" /> Complete Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
