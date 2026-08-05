import { ImageResponse } from "next/og";

export const alt =
  "BLISKO24 – Znajdź ludzi, nie tylko ogłoszenia";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #0891b2 100%)",
          color: "white",
          padding: "72px 82px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "26px",
          }}
        >
          <div
            style={{
              width: "104px",
              height: "104px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "30px",
              background: "white",
              color: "#1d4ed8",
              fontSize: "64px",
              fontWeight: 900,
              boxShadow: "0 18px 45px rgba(15, 23, 42, 0.3)",
            }}
          >
            B
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: "58px",
                fontWeight: 900,
                letterSpacing: "-2px",
              }}
            >
              BLISKO24
            </div>

            <div
              style={{
                marginTop: "4px",
                color: "#bfdbfe",
                fontSize: "26px",
                fontWeight: 700,
              }}
            >
              Portal lokalnych możliwości
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "950px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "67px",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-3px",
            }}
          >
            <div style={{ display: "flex" }}>
              Znajdź ludzi,
            </div>

            <div style={{ display: "flex" }}>
              nie tylko ogłoszenia.
            </div>
          </div>

          <div
            style={{
              marginTop: "34px",
              display: "flex",
              gap: "18px",
              fontSize: "25px",
              fontWeight: 700,
              color: "#e0f2fe",
            }}
          >
            <span>Praca</span>
            <span>•</span>
            <span>Pomoc</span>
            <span>•</span>
            <span>Ludzie</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "23px",
            fontWeight: 700,
            color: "#dbeafe",
          }}
        >
          <span>blisko24.com.pl</span>
          <span>Cała Polska</span>
        </div>
      </div>
    ),
    size
  );
}