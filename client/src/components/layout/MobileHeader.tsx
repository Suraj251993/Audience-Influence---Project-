import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center p-4 border-b">
                  <span className="text-lg font-bold text-gray-900">InfluenceHub</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                  <Link href="/">
                    <a
                      className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </a>
                  </Link>
                  <Link href="/influencers">
                    <a
                      className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      Discover Influencers
                    </a>
                  </Link>
                  <Link href="/campaigns">
                    <a
                      className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      Campaigns
                    </a>
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <span className="ml-2 text-lg font-bold text-gray-900">InfluenceHub</span>
        </div>
        <img
          className="w-8 h-8 rounded-full object-cover"
          src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
          alt="User profile"
        />
      </div>
    </div>
  );
}
