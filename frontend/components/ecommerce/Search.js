import { useRouter } from "next/router";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

const Search = () => {
  const t = useTranslations("search");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    console.log("click");
    router.push({
      pathname: "/products",
      query: {
        search: searchTerm,
      },
    });
    setSearchTerm("");
  };

  const handleInput = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };
  return (
    <form style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
      <select className="select-active">
        <option>{t("allCategories")}</option>
        <option>{t("womens")}</option>
        <option>{t("mens")}</option>
        <option>{t("cellphones")}</option>
        <option>{t("computer")}</option>
        <option>{t("electronics")}</option>
        <option>{t("accessories")}</option>
        <option>{t("homeGarden")}</option>
        <option>{t("luggage")}</option>
        <option>{t("shoes")}</option>
        <option>{t("motherKids")}</option>
      </select>
      <input
        value={searchTerm}
        onKeyDown={handleInput}
        onChange={(e) => setSearchTerm(e.target.value)}
        type="text"
        placeholder={t("placeholder")}
      />
    </form>
  );
};

export default Search;
