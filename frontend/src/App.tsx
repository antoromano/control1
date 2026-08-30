import { Route, HashRouter, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Nutrition from "./pages/Nutrition";
import Training from "./pages/Training";
import Habits from "./pages/Habits";
import Media from "./pages/Media";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="nutrizione" element={<Nutrition />} />
          <Route path="allenamento" element={<Training />} />
          <Route path="abitudini" element={<Habits />} />
          <Route path="media" element={<Media />} />
          <Route path="report" element={<Reports />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
