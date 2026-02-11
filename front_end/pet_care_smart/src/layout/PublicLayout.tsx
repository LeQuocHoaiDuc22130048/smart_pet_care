import { Outlet } from "react-router-dom"

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* <PublicFooter /> */}
    </div>
  )
}

export default PublicLayout