import AssetTransferTable from '../../../components/asset-transfer-table';
import TransferAssetForm from "@/components/transfer-asset-form"
import ProtectedRoute from "@/components/ProtectedRoute";
import SupportCallForm from '@/components/support-call-form';
import SupportStatusTable from '@/components/support-status-table';


export default function Page() {
  return (
    <ProtectedRoute>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div>   
              <SupportCallForm />
            </div>
            <SupportStatusTable />
          </div>
        </div>
    </ProtectedRoute>  
  )
}
