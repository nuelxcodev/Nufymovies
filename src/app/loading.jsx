import { BiServer } from "react-icons/bi";
import { BsGear } from "react-icons/bs";

export default function Loading() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-tr from-neutral-800 to-neutral-700 text-white">
      <div className="w-64">
        <div className="flex items-center gap-2 mb-7">
          <BsGear size={30} className="animate-spin" />
          <span className="h-[2px] flex-1 bg-white animate-pulse" />
          <BiServer size={30} />
        </div>
        <span>Loading data, please wait…</span>
      </div>
    </div>
  );
}
