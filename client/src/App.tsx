import { useState } from 'react'
import UploadBox from './modules/upload/components/UploadBox'
import UploadLibrary from './modules/upload/components/UploadLibrary'
import Layout from './shared/components/Layout'
import MainViewSwitcher, { type MainView } from './shared/components/MainViewSwitcher'

function App() {
  const [page, setPage] = useState<MainView>('upload')
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0)

  const bumpLibrary = () => setLibraryRefreshKey((k) => k + 1)

  const handleViewChange = (view: MainView) => {
    if (view === 'library') {
      bumpLibrary()
    }
    setPage(view)
  }

  return (
    <Layout>
      <MainViewSwitcher active={page} onChange={handleViewChange} />
      {page === 'upload' ? (
        <UploadBox onUploadBatchFinished={bumpLibrary} />
      ) : (
        <UploadLibrary refreshKey={libraryRefreshKey} />
      )}
    </Layout>
  )
}

export default App
