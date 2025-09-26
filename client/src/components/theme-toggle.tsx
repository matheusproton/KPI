import { Monitor, MonitorOff, SunMedium, MoonStar } from "lucide-react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/lib/theme"

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Tam ekran moduna geçilemedi:', err)
      })
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('Tam ekran modundan çıkılamadı:', err)
      })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="secondary" 
        size="icon"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
        className="border border-gray-200 rounded-md p-2 hover:bg-white transition-colors duration-200"
      >
        {isFullscreen ? (
          <MonitorOff className="h-5 w-5 text-gray-800" />
        ) : (
          <Monitor className="h-5 w-5 text-gray-800" />
        )}
        <span className="sr-only">Toggle fullscreen</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="secondary" 
            size="icon" 
            className="border border-gray-200 rounded-md p-2 hover:bg-white transition-colors duration-200"
          >
            <SunMedium className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-800" />
            <MoonStar className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-800" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Aydınlık
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Karanlık
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            Sistem
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}