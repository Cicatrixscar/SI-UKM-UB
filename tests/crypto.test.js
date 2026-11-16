import { describe, it, expect } from 'vitest'
import { hashPassword, verifikasiPassword } from '../src/utils/crypto.js'

describe('Utilitas Kriptografi SHA-512 (crypto.js)', () => {
  it('menolak password kosong', async () => {
    await expect(hashPassword('')).rejects.toThrow()
  })

  it('menghasilkan hash 128 karakter heksadesimal (512 bit)', async () => {
    const hash = await hashPassword('RahasiaUB123!', 'akumahasiswa@student.ub.ac.id')
    expect(hash).toHaveLength(128)
    expect(/^[0-9a-f]{128}$/.test(hash)).toBe(true)
  })

  it('menghasilkan hash yang konsisten untuk input yang sama', async () => {
    const hash1 = await hashPassword('password123', 'user@student.ub.ac.id')
    const hash2 = await hashPassword('password123', 'user@student.ub.ac.id')
    expect(hash1).toBe(hash2)
  })

  it('menghasilkan hash berbeda jika password atau salt email berbeda', async () => {
    const hash1 = await hashPassword('password123', 'user1@student.ub.ac.id')
    const hash2 = await hashPassword('password123', 'user2@student.ub.ac.id')
    const hash3 = await hashPassword('passwordBerbeda', 'user1@student.ub.ac.id')
    expect(hash1).not.toBe(hash2)
    expect(hash1).not.toBe(hash3)
  })

  it('verifikasiPassword mengembalikan true jika cocok dan false jika salah', async () => {
    const email = 'akumahasiswa@student.ub.ac.id'
    const passwordBenar = 'PasswordKuat!2026'
    const hash = await hashPassword(passwordBenar, email)

    const cocok = await verifikasiPassword(passwordBenar, hash, email)
    const salah = await verifikasiPassword('PasswordSalah123', hash, email)
    const emailSalah = await verifikasiPassword(passwordBenar, hash, 'lain@student.ub.ac.id')

    expect(cocok).toBe(true)
    expect(salah).toBe(false)
    expect(emailSalah).toBe(false)
  })
})
