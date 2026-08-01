const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const VEHICLE_PHOTOS: Record<string, string[]> = {
  rav4: [
    unsplash("photo-1633511090690-2e7e6d09b419"),
    unsplash("photo-1568605117036-5fe5e7bab0b7"),
    unsplash("photo-1571127236794-81c0bbfe1ce3"),
  ],
  model3: [
    unsplash("photo-1560958089-b8a1929cea89"),
    unsplash("photo-1553440569-bcc63803a83d"),
  ],
  bronco: [
    unsplash("photo-1533106497176-45ae19e68ba2"),
    unsplash("photo-1519641471654-76ce0107ad1b"),
  ],
  wrangler: [
    unsplash("photo-1626668893632-6f3a4466d22f"),
    unsplash("photo-1519641471654-76ce0107ad1b"),
  ],
  cherokee: [unsplash("photo-1533473359331-0135ef1b58bf")],
};

export const COMPANY_BANNER = unsplash("photo-1477959858617-67f85cf4f1df", 1600);
export const COMPANY_AVATAR = unsplash("photo-1633332755192-727a05c4013d", 300);
export const GUEST_AVATAR = unsplash("photo-1633332755192-727a05c4013d", 300);
export const CITY_MIAMI = unsplash("photo-1506966953602-c20cc11f75e3", 900);
export const CITY_LA = unsplash("photo-1444723121867-7a241cacace9", 900);
export const CITY_LV = unsplash("photo-1605833556294-ea5c7a74f57d", 900);
