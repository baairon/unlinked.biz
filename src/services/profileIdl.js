export const PROFILE_IDL = {
  address: import.meta.env.VITE_PROFILE_PROGRAM_ID || 'DQfdaW4gHY64GJpocjyseyB3QAwava5EseW7Ghi9YRRp',
  metadata: {
    name: 'unlinked_profile',
    version: '0.1.0',
    spec: '0.1.0',
  },
  instructions: [
    {
      name: 'initialize_profile',
      discriminator: [32, 145, 77, 213, 58, 39, 251, 234],
      accounts: [
        { name: 'profile', writable: true },
        { name: 'authority', writable: true, signer: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [{ name: 'cid', type: 'string' }],
    },
    {
      name: 'update_profile',
      discriminator: [98, 67, 99, 206, 86, 115, 175, 1],
      accounts: [
        { name: 'profile', writable: true },
        { name: 'authority', writable: true, signer: true },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [{ name: 'cid', type: 'string' }],
    },
  ],
  accounts: [
    {
      name: 'ProfileAccount',
      discriminator: [105, 84, 179, 172, 116, 226, 171, 52],
    },
  ],
  types: [
    {
      name: 'ProfileAccount',
      type: {
        kind: 'struct',
        fields: [
          { name: 'authority', type: 'pubkey' },
          { name: 'cid', type: 'string' },
          { name: 'updated_at', type: 'i64' },
          { name: 'version', type: 'u32' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
  ],
}
