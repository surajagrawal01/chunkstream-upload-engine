import { useEffect } from 'react'
import UploadBox from './modules/upload/components/UploadBox'
import Layout from './shared/components/Layout'
import { clearUploadSession } from './modules/upload/utils/uploadSession'

function App() {

  useEffect(() => {
    clearUploadSession()
  })

  return (
    <>
      <Layout>
        <UploadBox />
      </Layout>
    </>
  )
}

export default App
