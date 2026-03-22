export const CONNECTIONS_IDL = {
  address: import.meta.env.VITE_CONNECTIONS_PROGRAM_ID || '11111111111111111111111111111111',
  metadata: {
    name: 'unlinked_connections',
    version: '0.1.0',
    spec: '0.1.0',
  },
  instructions: [
    {
      name: 'send_request',
      discriminator: [187, 167, 250, 39, 135, 91, 252, 22],
      accounts: [
        { name: 'connection', writable: true },
        { name: 'from', writable: true, signer: true },
        { name: 'to' },
        { name: 'system_program', address: '11111111111111111111111111111111' },
      ],
      args: [
        { name: 'wallet_a', type: 'pubkey' },
        { name: 'wallet_b', type: 'pubkey' },
      ],
    },
    {
      name: 'accept_request',
      discriminator: [4, 60, 28, 227, 25, 199, 246, 124],
      accounts: [
        { name: 'connection', writable: true },
        { name: 'to', signer: true },
      ],
      args: [
        { name: 'wallet_a', type: 'pubkey' },
        { name: 'wallet_b', type: 'pubkey' },
      ],
    },
    {
      name: 'reject_request',
      discriminator: [11, 232, 75, 149, 197, 137, 152, 208],
      accounts: [
        { name: 'connection', writable: true },
        { name: 'closer', writable: true, signer: true },
      ],
      args: [
        { name: 'wallet_a', type: 'pubkey' },
        { name: 'wallet_b', type: 'pubkey' },
      ],
    },
    {
      name: 'remove_connection',
      discriminator: [200, 145, 119, 103, 85, 190, 120, 138],
      accounts: [
        { name: 'connection', writable: true },
        { name: 'closer', writable: true, signer: true },
      ],
      args: [
        { name: 'wallet_a', type: 'pubkey' },
        { name: 'wallet_b', type: 'pubkey' },
      ],
    },
  ],
  accounts: [
    {
      name: 'ConnectionAccount',
      discriminator: [180, 97, 246, 63, 243, 77, 242, 196],
    },
  ],
  types: [
    {
      name: 'ConnectionAccount',
      type: {
        kind: 'struct',
        fields: [
          { name: 'from', type: 'pubkey' },
          { name: 'to', type: 'pubkey' },
          { name: 'status', type: 'u8' },
          { name: 'created_at', type: 'i64' },
          { name: 'accepted_at', type: 'i64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
  ],
}
