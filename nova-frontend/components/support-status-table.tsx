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

const apiUrl = process.env.NEXT_PUBLIC_API_URL

type SupportEntry = {
  Call_Id: string
  AssetCode: string
  AssetType: string
  CallRegDate: string
  Empno: string
  UserName: string
  IssueType: string
  IssueDetails: string
  ResolveStatus: number | null
  EscalationStatus: number | null
}

export default function SupportStatusTable() {
  const [entries, setEntries] = useState<SupportEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      const empNo = sessionStorage.getItem("EmpNo")?.slice(1, -1) || ""
      const token = sessionStorage.getItem("token")

      const res = await fetch(`${apiUrl}/manage-support/user-requests/${empNo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error("Failed to fetch support calls")

      const data = await res.json()
      console.log("Support Calls Data:", data)
      setEntries(data)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [])

  const getStatus = (val: number | null): string => {
    if (val == 1) return "Resolved"
    if (val == 0) return "Unresolved"
    return "Pending"
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Support Request Status</h3>
        <p className="text-sm text-muted-foreground">
          View the progress of your submitted support calls.
        </p>
      </div>

      <div className="overflow-x-auto">
        <Card className="min-w-[1000px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Asset Code</TableHead>
                <TableHead>Asset Type</TableHead>
                <TableHead>Issue Type</TableHead>
                <TableHead>Issue Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Escalated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-red-500 py-4">
                    {error}
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No support calls found.
                  </TableCell>

                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.Call_Id}>
                    <TableCell>{entry.Call_Id}</TableCell>
                    <TableCell>{entry.AssetCode}</TableCell>
                    <TableCell>{entry.AssetType}</TableCell>
                    <TableCell>{entry.IssueType}</TableCell>
                    <TableCell>{entry.IssueDetails}</TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          getStatus(entry.ResolveStatus) === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : getStatus(entry.ResolveStatus) === "Unresolved"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {getStatus(entry.ResolveStatus)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {entry.EscalationStatus === 1 ? (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                          Escalated
                        </span>
                      ) : (
                        "-"
                      )}
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
