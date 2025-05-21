"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

// Map asset types to logo filenames in public/
const assetTypeLogos: Record<string, string> = {
  Laptop: "/window.svg",
  Printer: "/file.svg",
  Server: "/vercel.svg",
  Network: "/globe.svg",
  // Add more mappings as needed
}

function getAssetLogo(type: string) {
  return assetTypeLogos[type] || "/next.svg"
}

export default function AssetsSection() {
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = sessionStorage.getItem("token")
        const EmpNo = sessionStorage.getItem("EmpNo")?.replace(/['\"]+/g, "")
        if (!token || !EmpNo) {
          setError("Missing authentication or employee info.")
          setLoading(false)
          return
        }
        const res = await fetch(`${apiUrl}/utils/assets-for-emp`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        if (!res.ok) throw new Error("Failed to fetch assets.")
        const data = await res.json()
        console.log("Assets:", data)
        setAssets(data.assets || [])
      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchAssets()
  }, [])

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-8 space-y-4">
      <h2 className="text-xl font-semibold mb-4">My Assets</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="min-h-[140px] flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : assets.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">No assets assigned to you.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {assets.map((asset, idx) => (
            <Card key={asset.AssetCode || idx} className="min-h-[140px] flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage src={getAssetLogo(asset.AssetType)} alt={asset.AssetType || "Asset"} />
                  <AvatarFallback>{(asset.AssetType || "?").charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg font-bold leading-tight">{asset.AssetCode}</CardTitle>
                  <CardDescription className="truncate">{asset.AssetDescription}</CardDescription>
                </div>
                <Badge variant="secondary">{asset.AssetType}</Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground mb-1">Brand: <span className="font-medium text-foreground">{asset.AssetBrand || "-"}</span></div>
                <div className="text-xs text-muted-foreground">Model: <span className="font-medium text-foreground">{asset.AssetModel || "-"}</span></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
