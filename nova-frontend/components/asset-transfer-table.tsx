"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type TransferEntry = {
  RecID: number
  TransferCode: string
  AssetCode: string
  AssetDesc: string
  TransferFrom: string
  TransferTo: string
  ReasonOfTransfer: string
  ApproveByTransTo: number | null
  ApproveByAdmin: number | null
  Remarks: string | null
  EnteredBy: string
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export default function AssetTransferTable() {
  const [transfers, setTransfers] = useState<TransferEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const token = sessionStorage.getItem("token")
        const response = await fetch(`${apiUrl}/transfer-asset-function/transfers-list`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error("Failed to fetch transfers")

        const data = await response.json()

        setTransfers(data)
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchTransfers()
  }, [])

  const getStatus = (entry: TransferEntry): string => {
    if (entry.ApproveByAdmin === 0 || entry.ApproveByTransTo === 0) return "Rejected"
    if (entry.ApproveByAdmin === 1 && entry.ApproveByTransTo === 1) return "Done"
    return "In Process"
  }

  if (!transfers || transfers.length === 0) {
    return <div className="text-center text-sm text-muted-foreground py-8">No transfer found.</div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-4">
      {/* Heading */}
      <div>
        <h3 className="text-lg font-semibold">Transfer History</h3>
        <p className="text-sm text-muted-foreground">
          A record of all recent asset transfer requests.
        </p>
      </div>

      {/* Table Scroll Container */}
      <div className="overflow-x-auto">
        <Card className="min-w-[900px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">From</TableHead>
                <TableHead className="text-muted-foreground">To</TableHead>
                <TableHead className="text-muted-foreground">Device ID</TableHead>
                <TableHead className="text-muted-foreground">Description</TableHead>
                <TableHead className="text-muted-foreground">Reason</TableHead>
                <TableHead className="text-muted-foreground">Remarks</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-red-500 py-4">
                    {error}
                  </TableCell>
                </TableRow>
              ) : transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No transfer records found.
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((entry) => (
                  <TableRow key={entry.RecID}>
                    <TableCell className="font-medium">{entry.TransferCode.trim()}</TableCell>
                    <TableCell>{entry.TransferFrom.trim()}</TableCell>
                    <TableCell>{entry.TransferTo.trim()}</TableCell>
                    <TableCell>{entry.AssetCode.trim()}</TableCell>
                    <TableCell>{entry.AssetDesc.trim()}</TableCell>
                    <TableCell>{entry.ReasonOfTransfer}</TableCell>
                    <TableCell>{entry.Remarks ?? "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          getStatus(entry) === "Done"
                            ? "bg-green-100 text-green-700"
                            : getStatus(entry) === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {getStatus(entry)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
