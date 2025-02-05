module.exports = {
    async rewrites() {
      return [
        {
          source: "/api/register",
          destination: "https://tu-api.com/register",
        },
      ];
    },
  };
  //por si acaso