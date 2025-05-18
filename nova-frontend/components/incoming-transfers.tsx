"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function IncomingTransfer() {
  const [data, setData] = useState([])
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [remarks, setRemarks] = useState("")
  const [isApproved, setIsApproved] = useState<boolean | null>(null)

  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null

  const fetchData = async () => {
    try {
      const res = await fetch(`${apiUrl}/transfer-asset-function/pending-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const json = await res.json()
      if (Array.isArray(json)) {
        setData(json)
      } else if (Array.isArray(json?.data)) {
        setData(json.data)
      } else {
        toast.error("Unexpected response format")
        setData([])
      }
    } catch (err) {
      toast.error("Failed to fetch asset transfer data")
      setData([])
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApprove = (id: number) => {
    setSelectedId(id)
    setIsApproved(true)
    setOpen(true)
  }

  const handleReject = (id: number) => {
    setSelectedId(id)
    setIsApproved(false)
    setOpen(true)
  }

  const handleSubmitAction = async () => {
    if (selectedId === null || isApproved === null) return

    try {
      const res = await fetch(`${apiUrl}/transfer-asset-function/approve/${selectedId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ApproveByTransTo: isApproved ? 1 : 0,
          Remarks: remarks,
        }),
      })

      if (res.ok) {
        toast.success(`Transfer ${selectedId} ${isApproved ? "approved" : "rejected"}`)
        setOpen(false)
        setRemarks("")
        setSelectedId(null)
        setIsApproved(null)
        fetchData()
      } else {
        toast.error(`${isApproved ? "Approval" : "Rejection"} failed`)
      }
    } catch (err) {
      toast.error(`An error occurred during ${isApproved ? "approval" : "rejection"}`)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Pending Asset Transfers</h3>
        <p className="text-sm text-muted-foreground">Approve or reject incoming asset transfer requests.</p>
      </div>

      <div className="overflow-x-auto">
        <Card className="min-w-[900px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer Code</TableHead>
                <TableHead>Asset Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(data) && data.length > 0 ? (
                data.map((entry) => (
                  <TableRow key={entry.TransferCode}>
                    <TableCell>{entry.TransferCode?.trim?.()}</TableCell>
                    <TableCell>{entry.AssetCode?.trim?.()}</TableCell>
                    <TableCell>{entry.AssetDesc?.trim?.()}</TableCell>
                    <TableCell>{entry.TransferFrom?.trim?.()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => handleApprove(entry.TransferCode)}>Approve</Button>
                        <Button className="black" onClick={() => handleReject(entry.TransferCode)}>Reject</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No incoming transfer found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isApproved ? "Approval" : "Rejection"} Remarks</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={`Enter your ${isApproved ? "approval" : "rejection"} remarks...`}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="mt-2"
          />
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitAction}>Confirm {isApproved ? "Approval" : "Rejection"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
