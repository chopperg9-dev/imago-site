import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/sonner";
import SmoothScroll from "@/components/SmoothScroll";
import PaintCursor from "@/components/PaintCursor";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductPage from "@/pages/ProductPage";
import SuperheroPage from "@/pages/SuperheroPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import AboutPage from "@/pages/AboutPage";
import FaqPage from "@/pages/FaqPage";
import ContactPage from "@/pages/ContactPage";
import InfoPage from "@/pages/InfoPage";
import NotFound from "@/pages/NotFound";
import PaymentSuccess from "@/pages/PaymentSuccess";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <CartProvider>
      <SmoothScroll />
      <ScrollToTop />
      <PaintCursor />
      <div className="grain min-h-screen bg-cream text-clay">
        <Header />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/superhero" element={<SuperheroPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/shipping" element={<InfoPage kind="shipping" />} />
            <Route path="/returns" element={<InfoPage kind="returns" />} />
            <Route path="/privacy" element={<InfoPage kind="privacy" />} />
            <Route path="/terms" element={<InfoPage kind="terms" />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
        <Footer />
      </div>
      <Toaster />
    </CartProvider>
  );
}
