\"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Save, User, Phone, Briefcase, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import PixelatedBackground from "@/components/pixelated-background"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // User profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    preferredMarkets: ["US", "Global"],
    favoriteStocks: [],
    notifications: {
      priceAlerts: true,
      newsAlerts: true,
      marketSummary: false
    },
    tradingPreferences: {
      defaultTimeframe: "1D",
      defaultChartType: "candle"
    }
  })

  // Load profile data from database on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First check localStorage for cached data
        const savedProfile = localStorage.getItem('userProfile')
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile))
        }
        
        // Then try to fetch from API (in a real app, you would use authentication)
        // For demo purposes, we'll use a hardcoded email
        const email = 'user@example.com' // In a real app, this would come from auth context
        const response = await fetch(`/api/user?email=${encodeURIComponent(email)}`)
        
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          // Update localStorage cache
          localStorage.setItem('userProfile', JSON.stringify(data))
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Using cached data if available.",
          variant: "destructive"
        })
      }
    }
    
    fetchProfile()
  }, [])

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }))
  }

  const handleTradingPrefChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      tradingPreferences: {
        ...prev.tradingPreferences,
        [field]: value
      }
    }))
  }

  const handleSaveProfile = async () => {
    try {
      // Save to localStorage as cache
      localStorage.setItem('userProfile', JSON.stringify(profile))
      
      // Save to database via API
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save profile')
      }
      
      toast({
        title: "Profile Saved",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to save profile to database. Your data is saved locally.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <PixelatedBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800 backdrop-blur-md bg-black/40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                className="flex items-center text-gray-400 hover:text-white"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
                User Profile
              </h1>
              <Button 
                onClick={handleSaveProfile}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Profile Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="md:col-span-1"
            >
              <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="mb-6 mt-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" />
                      <AvatarFallback className="text-2xl">U</AvatarFallback>
                    </Avatar>
                  </div>
                  <h2 className="text-xl font-bold mb-1">{profile.name || "User Name"}</h2>
                  <p className="text-gray-400 text-sm mb-4">{profile.email || "user@example.com"}</p>
                  <Button variant="outline" className="w-full mb-2">
                    <User className="h-4 w-4 mr-2" />
                    Change Avatar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="md:col-span-3"
            >
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6 bg-gray-800/50">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="preferences">Trading Preferences</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-0">
                  <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            value={profile.name} 
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profile.email} 
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <Input 
                            id="phone" 
                            value={profile.phone} 
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio" 
                          value={profile.bio} 
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          className="bg-gray-800 border-gray-700 min-h-[100px]"
                          placeholder="Tell us about yourself and your trading experience..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences" className="mt-0">
                  <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Trading Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Chart Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="defaultTimeframe">Default Timeframe</Label>
                            <Select 
                              value={profile.tradingPreferences.defaultTimeframe}
                              onValueChange={(value) => handleTradingPrefChange('defaultTimeframe', value)}
                            >
                              <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Select timeframe" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1D">1 Day</SelectItem>
                                <SelectItem value="1W">1 Week</SelectItem>
                                <SelectItem value="1M">1 Month</SelectItem>
                                <SelectItem value="3M">3 Months</SelectItem>
                                <SelectItem value="1Y">1 Year</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="defaultChartType">Default Chart Type</Label>
                            <Select
                              value={profile.tradingPreferences.defaultChartType}
                              onValueChange={(value) => handleTradingPrefChange('defaultChartType', value)}
                            >
                              <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Select chart type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="line">Line</SelectItem>
                                <SelectItem value="candle">Candlestick</SelectItem>
                                <SelectItem value="bar">Bar</SelectItem>
                                <SelectItem value="area">Area</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Market Preferences</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Preferred Markets</Label>
                            <div className="flex flex-wrap gap-2">
                              {["US", "Global", "Crypto", "Forex", "Commodities"].map(market => (
                                <Button 
                                  key={market}
                                  variant={profile.preferredMarkets.includes(market) ? "default" : "outline"}
                                  size="sm"
                                  className={profile.preferredMarkets.includes(market) ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                  onClick={() => {
                                    if (profile.preferredMarkets.includes(market)) {
                                      handleInputChange('preferredMarkets', 
                                        profile.preferredMarkets.filter(m => m !== market)
                                      )
                                    } else {
                                      handleInputChange('preferredMarkets', 
                                        [...profile.preferredMarkets, market]
                                      )
                                    }
                                  }}
                                >
                                  {market}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Favorite Sectors</Label>
                            <div className="flex flex-wrap gap-2">
                              {["Technology", "Healthcare", "Finance", "Energy", "Consumer"].map(sector => (
                                <Button 
                                  key={sector}
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-700"
                                >
                                  {sector}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-0">
                  <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="priceAlerts">Price Alerts</Label>
                            <p className="text-sm text-gray-400">Receive notifications when stocks hit your price targets</p>
                          </div>
                          <Switch 
                            id="priceAlerts" 
                            checked={profile.notifications.priceAlerts}
                            onCheckedChange={(checked) => handleNotificationChange('priceAlerts', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="newsAlerts">News Alerts</Label>
                            <p className="text-sm text-gray-400">Get notified about important news for your watchlist stocks</p>
                          </div>
                          <Switch 
                            id="newsAlerts" 
                            checked={profile.notifications.newsAlerts}
                            onCheckedChange={(checked) => handleNotificationChange('newsAlerts', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="marketSummary">Market Summary</Label>
                            <p className="text-sm text-gray-400">Receive daily market summary reports</p>
                          </div>
                          <Switch 
                            id="marketSummary" 
                            checked={profile.notifications.marketSummary}
                            onCheckedChange={(checked) => handleNotificationChange('marketSummary', checked)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}