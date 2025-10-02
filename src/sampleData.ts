export const sampleOtpPlanJson = JSON.stringify(
  {
    plan: {
      itineraries: [
        {
          legs: [
            {
              route: {
                shortName: '10',
              },
              fareProducts: [
                {
                  id: 'fare:default-1',
                  product: {
                    __typename: 'DefaultFareProduct',
                    id: 'default-1',
                    name: 'Adult Single Ride',
                    medium: {
                      id: 'mobile-pass',
                      name: 'Mobile App',
                    },
                    riderCategory: {
                      id: 'adult',
                      name: 'Adult',
                    },
                    price: {
                      amount: 250,
                      currency: {
                        code: 'USD',
                        digits: 2,
                      },
                    },
                  },
                },
              ],
            },
            {
              route: {
                shortName: '20',
              },
              fareProducts: [
                {
                  id: 'fare:default-1',
                  product: {
                    __typename: 'DefaultFareProduct',
                    id: 'default-1',
                    name: 'Adult Single Ride',
                    medium: {
                      id: 'mobile-pass',
                      name: 'Mobile App',
                    },
                    riderCategory: {
                      id: 'adult',
                      name: 'Adult',
                    },
                    price: {
                      amount: 250,
                      currency: {
                        code: 'USD',
                        digits: 2,
                      },
                    },
                  },
                },
                {
                  id: 'fare:dependent-1',
                  product: {
                    __typename: 'DependentFareProduct',
                    id: 'dependent-1',
                    name: 'Transfer Discount',
                    medium: {
                      id: 'mobile-pass',
                      name: 'Mobile App',
                    },
                    riderCategory: {
                      id: 'adult',
                      name: 'Adult',
                    },
                    dependencies: [
                      {
                        id: 'default-1',
                      },
                    ],
                    price: {
                      amount: -50,
                      currency: {
                        code: 'USD',
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          legs: [
            {
              route: {
                shortName: 'Green',
              },
              fareProducts: [
                {
                  id: 'fare:default-1',
                  product: {
                    __typename: 'DefaultFareProduct',
                    id: 'default-1',
                    name: 'Adult Single Ride',
                    medium: {
                      id: 'smart-card',
                      name: 'Smart Card',
                    },
                    riderCategory: {
                      id: 'adult',
                      name: 'Adult',
                    },
                    price: {
                      amount: 275,
                      currency: {
                        code: 'USD',
                        digits: 2,
                      },
                    },
                  },
                },
                {
                  id: 'fare:dependent-2',
                  product: {
                    __typename: 'DependentFareProduct',
                    id: 'dependent-2',
                    name: 'Evening Discount',
                    medium: {
                      id: 'smart-card',
                      name: 'Smart Card',
                    },
                    riderCategory: {
                      id: 'adult',
                      name: 'Adult',
                    },
                    dependencies: [
                      {
                        id: 'default-1',
                      },
                      {
                        id: 'default-2',
                        name: 'Night Transfer',
                      },
                    ],
                    price: {
                      amount: -25,
                      currency: {
                        code: 'USD',
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  null,
  2,
)

