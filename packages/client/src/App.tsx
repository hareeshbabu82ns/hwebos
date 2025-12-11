import React from "react";
import { useWindowStore } from "@hmac/core";
import { Rnd } from "react-rnd";
import TerminalApp from "@hmac-app/terminal";
import FinderApp from "@hmac-app/finder";

const App = () => {
  const raptorEnabled = import.meta.env.VITE_ENABLE_RAPTOR_MINI === "true";
  const { windows, windowOrder, focusWindow, setWindowBounds, closeWindow } =
    useWindowStore();

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {raptorEnabled && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded z-50 text-sm">
          Raptor mini (Preview) enabled
        </div>
      )}
      {/* Desktop Icons Layer */}
      <div className="absolute inset-0 p-4 grid grid-cols-1 gap-4 content-start justify-items-start w-24">
        <div className="flex flex-col items-center gap-1 group cursor-pointer">
          <div className="w-16 h-16 bg-blue-500 rounded-xl shadow-lg group-hover:bg-blue-400 transition-colors"></div>
          <span className="text-white text-xs drop-shadow-md font-medium">
            My Computer
          </span>
        </div>
      </div>

      {/* Windows Layer */}
      {windowOrder.map((id) => {
        const win = windows[id];
        if (!win || win.isMinimized) return null;

        return (
          <Rnd
            key={id}
            size={{ width: win.bounds.width, height: win.bounds.height }}
            position={{ x: win.bounds.x, y: win.bounds.y }}
            onDragStop={(e, d) => {
              setWindowBounds(id, { x: d.x, y: d.y });
              focusWindow(id);
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              setWindowBounds(id, {
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
                ...position,
              });
              focusWindow(id);
            }}
            onMouseDown={() => focusWindow(id)}
            className={`glass-panel rounded-lg overflow-hidden flex flex-col ${win.isFocused ? "z-50 ring-1 ring-white/30" : "z-0"}`}
            dragHandleClassName="window-titlebar"
            minWidth={300}
            minHeight={200}
            bounds="parent"
          >
            {/* Title Bar */}
            <div className="window-titlebar h-8 bg-white/10 flex items-center px-3 justify-between select-none cursor-default">
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(id);
                  }}
                  className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"
                />
                <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600" />
                <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600" />
              </div>
              <span className="text-white/80 text-sm font-medium">
                {win.title}
              </span>
              <div className="w-12"></div> {/* Spacer for centering */}
            </div>

            {/* Content */}
            <div className="flex-1 bg-white/80 p-4 overflow-auto">
              {win.component ? (
                <win.component />
              ) : (
                <div className="text-gray-800">Window Content</div>
              )}
            </div>
          </Rnd>
        );
      })}

      {/* Dock Layer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-16 glass-panel rounded-2xl flex items-center gap-4 px-4 z-[100]">
        <button
          className="w-12 h-12 bg-gray-800 rounded-xl hover:scale-110 transition-transform"
          onClick={() =>
            useWindowStore.getState().createWindow({
              appId: "terminal",
              title: "Terminal",
              component: TerminalApp,
            })
          }
        >
          <div className="text-white text-[8px] text-center pt-1">Term</div>
        </button>
        <button
          className="w-12 h-12 bg-blue-600 rounded-xl hover:scale-110 transition-transform"
          onClick={() =>
            useWindowStore.getState().createWindow({
              appId: "finder",
              title: "Finder",
              component: FinderApp,
            })
          }
        >
          <div className="text-white text-[8px] text-center pt-1">Finder</div>
        </button>
      </div>
    </div>
  );
};

export default App;
