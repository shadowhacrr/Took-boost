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
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Users, DollarSign, ShoppingCart, Clock, Trash2, Plus, Lock,
  Activity, MessageSquare, Star, Phone, ArrowLeft, RefreshCw, CreditCard
} from 'lucide-react'

export default function OwnerPanel() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [admins, setAdmins] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [complaints, setComplaints] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [pricing, setPricing] = useState<any>(null)

  // Forms
  const [newAdminUser, setNewAdminUser] = useState('')
  const [newAdminPass, setNewAdminPass] = useState('')
  const [ownerUsername, setOwnerUsername] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [ownerWhatsapp, setOwnerWhatsapp] = useState('')

  const loadAll = async () => {
    try {
      const [s, a, orderList, c, r, act, p, info] = await Promise.all([
        api.stats.get(),
        api.admins.list(),
        api.owner.orders(),
        api.complaints.list(),
        api.reviews.list(),
        api.activity.list(),
        api.pricing.get(),
        api.owner.info(),
      ])
      setStats(s)
      setAdmins(a)
      setOrders(orderList)
      setComplaints(c)
      setReviews(r)
      setActivity(act)
      setPricing(p)
      setOwnerUsername(info.username)
      setOwnerWhatsapp(info.whatsapp)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load data')
      if (err.message?.includes('Unauthorized')) {
        localStorage.removeItem('tokboost_token')
        navigate('/')
      }
    }
  }

  useEffect(() => {
    loadAll()
    const interval = setInterval(loadAll, 5000)
    return () => clearInterval(interval)
  }, [])

  const addAdmin = async () => {
    if (!newAdminUser || !newAdminPass) return toast.error('Fill all fields')
    try {
      const res = await api.admins.create({ username: newAdminUser, password: newAdminPass })
      if (res.success) {
        toast.success('Admin added!')
        setNewAdminUser('')
        setNewAdminPass('')
        loadAll()
      } else {
        toast.error(res.message || 'Failed to add admin')
      }
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const removeAdmin = async (id: string) => {
    if (!confirm('Delete this admin?')) return
    try {
      await api.admins.remove(id)
      toast.success('Admin removed')
      loadAll()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const updatePricing = async () => {
    try {
      await api.pricing.update(pricing)
      toast.success('Pricing updated')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const updateOwner = async () => {
    try {
      const data: any = { username: ownerUsername, whatsapp: ownerWhatsapp }
      if (ownerPassword) data.password = ownerPassword
      await api.owner.update(data)
      toast.success('Owner info updated')
      setOwnerPassword('')
      loadAll()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const deleteComplaint = async (id: string) => {
    try {
      await api.complaints.remove(id)
      toast.success('Complaint deleted')
      loadAll()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('tokboost_token')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-tiktok-dark text-white">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5 text-[#25F4EE]" />
            </Button>
            <h1 className="text-xl font-bold">
              Tok<span className="text-[#25F4EE]">Boost</span>{' '}
              <span className="text-[#FE2C55]">Owner Panel</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://wa.me/923001234567" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition">
              <Phone className="w-4 h-4" /> WhatsApp
            </a>
            <Button variant="outline" size="sm" onClick={logout} className="border-[#FE2C55] text-[#FE2C55]">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-8 h-8 text-[#25F4EE]" />
              <div>
                <p className="text-gray-400 text-sm">Total Admins</p>
                <p className="text-2xl font-bold">{stats?.totalAdmins || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-4 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-[#FE2C55]" />
              <div>
                <p className="text-gray-400 text-sm">Total Orders</p>
                <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold">{stats?.pendingOrders || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-4 flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-gray-400 text-sm">Revenue (PKR)</p>
                <p className="text-2xl font-bold">{stats?.totalRevenue || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="admins" className="w-full">
          <TabsList className="bg-[#0a0a0a] border border-[#1a1a1a] mb-4 flex-wrap h-auto">
            <TabsTrigger value="admins" className="data-[state=active]:bg-[#25F4EE] data-[state=active]:text-black">
              <Users className="w-4 h-4 mr-1" /> Admins
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-[#25F4EE] data-[state=active]:text-black">
              <ShoppingCart className="w-4 h-4 mr-1" /> Orders
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-[#25F4EE] data-[state=active]:text-black">
              <DollarSign className="w-4 h-4 mr-1" /> Pricing
            </TabsTrigger>
            <TabsTrigger value="complaints" className="data-[state=active]:bg-[#25F4EE] data-[state=active]:text-black">
              <MessageSquare className="w-4 h-4 mr-1" /> Complaints
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-[#25F4EE] data-[state=active]:text-black">
              <Star className="w-4 h-4 mr-1" /> Reviews
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-[#25F4EE] data-[state=active]:text-black">
              <Activity className="w-4 h-4 mr-1" /> Activity
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#FE2C55] data-[state=active]:text-white">
              <Lock className="w-4 h-4 mr-1" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admins">
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#25F4EE]" /> Add New Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 mb-6">
                  <Input
                    placeholder="Username"
                    value={newAdminUser}
                    onChange={(e) => setNewAdminUser(e.target.value)}
                    className="bg-[#111] border-[#222] text-white"
                  />
                  <Input
                    placeholder="Password"
                    type="text"
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    className="bg-[#111] border-[#222] text-white"
                  />
                  <Button onClick={addAdmin} className="bg-[#25F4EE] text-black hover:opacity-90">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <Separator className="mb-4 bg-[#1a1a1a]" />
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {admins.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-3 rounded-lg bg-[#111] border border-[#1a1a1a]">
                        <div>
                          <p className="font-semibold text-white">{admin.username}</p>
                          <p className="text-xs text-gray-500">Link: {admin.userLink}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[#25F4EE] border-[#25F4EE]/30 text-xs">
                              <CreditCard className="w-3 h-3 mr-1" />
                              {admin.walletType || 'No wallet'}
                            </Badge>
                            <Badge variant="outline" className="text-gray-400 border-gray-700 text-xs">
                              {admin.walletNumber || 'No number'}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeAdmin(admin.id)} className="text-red-500 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {admins.length === 0 && <p className="text-gray-500 text-center py-8">No admins yet</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white">All Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="p-3 rounded-lg bg-[#111] border border-[#1a1a1a]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white">{order.tiktokUsername}</p>
                            <p className="text-sm text-gray-400">{order.service} x {order.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#25F4EE] font-bold">Rs. {order.totalPrice}</p>
                            <Badge className={order.status === 'completed' ? 'bg-green-500/20 text-green-500' : order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">TXN: {order.transactionId}</p>
                        {order.paymentScreenshot && (
                          <img src={order.paymentScreenshot} alt="Payment" className="mt-2 max-w-[200px] rounded border border-[#222]" />
                        )}
                      </div>
                    ))}
                    {orders.length === 0 && <p className="text-gray-500 text-center py-8">No orders yet</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white">Service Pricing (PKR per unit)</CardTitle>
              </CardHeader>
              <CardContent>
                {pricing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(pricing).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <Label className="capitalize w-24 text-gray-300">{key}</Label>
                        <Input
                          type="number"
                          value={value as number}
                          onChange={(e) => setPricing({ ...pricing, [key]: parseInt(e.target.value) || 0 })}
                          className="bg-[#111] border-[#222] text-white"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <Button onClick={updatePricing} className="mt-4 bg-[#25F4EE] text-black hover:opacity-90">
                  <RefreshCw className="w-4 h-4 mr-1" /> Update Pricing
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complaints">
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white">Complaints</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {complaints.map((c) => (
                      <div key={c.id} className="p-3 rounded-lg bg-[#111] border border-[#1a1a1a]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-white">{c.name}</p>
                            <p className="text-sm text-gray-400">{c.email}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => deleteComplaint(c.id)} className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-300 mt-2">{c.message}</p>
                        <p className="text-xs text-gray-600 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                    {complaints.length === 0 && <p className="text-gray-500 text-center py-8">No complaints</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white">Admin Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-3 rounded-lg bg-[#111] border border-[#1a1a1a]">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-500 font-bold">{r.rating}/5</span>
                          <span className="text-gray-500 text-sm">for admin {r.adminId.slice(0, 8)}</span>
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

          <TabsContent value="activity">
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white">Live Admin Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {activity.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 p-2 rounded bg-[#111] border border-[#1a1a1a]">
                        <Activity className="w-4 h-4 text-[#25F4EE]" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-300"><span className="text-[#FE2C55]">{a.action}</span> - {a.details}</p>
                        </div>
                        <p className="text-xs text-gray-600">{new Date(a.timestamp).toLocaleTimeString()}</p>
                      </div>
                    ))}
                    {activity.length === 0 && <p className="text-gray-500 text-center py-8">No activity yet</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-[#0a0a0a] border-[#1a1a1a]">
              <CardHeader>
                <CardTitle className="text-white">Owner Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Username</Label>
                  <Input value={ownerUsername} onChange={(e) => setOwnerUsername(e.target.value)} className="bg-[#111] border-[#222] text-white" />
                </div>
                <div>
                  <Label className="text-gray-300">New Password (leave blank to keep current)</Label>
                  <Input type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} className="bg-[#111] border-[#222] text-white" placeholder="Enter new password" />
                </div>
                <div>
                  <Label className="text-gray-300">WhatsApp Number</Label>
                  <Input value={ownerWhatsapp} onChange={(e) => setOwnerWhatsapp(e.target.value)} className="bg-[#111] border-[#222] text-white" />
                </div>
                <Button onClick={updateOwner} className="bg-[#FE2C55] text-white hover:opacity-90">
                  <Lock className="w-4 h-4 mr-1" /> Update Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
