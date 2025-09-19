import { Card } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function VideoLists() {
  const rows = Array.from({ length: 1 }) // e.g. 5 rows
  const videos = Array.from({ length: 15 }) // 15 videos per row

  return (
    <div className="w-full flex-1 min-h-0 p-2 md:p-4 space-y-4 md:space-y-6 overflow-y-auto">
      {rows.map((_, rowIdx) => (
        <div key={rowIdx} className="space-y-1 md:space-y-2">
          {/* Row Title */}
          <h2 className="text-base md:text-lg font-semibold text-white">
            Row {rowIdx + 1}
          </h2>

          {/* Horizontal Scroll */}
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex gap-2 md:gap-3">
              {videos.map((_, vidIdx) => (
                <div key={vidIdx} className="min-w-[12rem] sm:min-w-[18rem] md:min-w-[24rem] lg:min-w-[30rem]">
                  <Card />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      ))}
    </div>
  )
}