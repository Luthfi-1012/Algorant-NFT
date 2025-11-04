# 🎟️ **Algorand-NFT**

> **NFT-based Ticketing System with Royalty and Anti-Scalping Mechanism**
> Built on the **Algorand Blockchain** to enable fair, transparent, and collectible event access.

---

## 👤 **About the Developer**

**Name:** Luthfi Pratama
**Role:** Blockchain Developer
**Focus:** Algorand Smart Contracts • Python (Beaker / Algopy) • Web3 Integration
**Experience:** Building decentralized ticketing and asset tokenization systems
**Goal:** Creating fair and transparent digital experiences through blockchain
**GitHub:** [Luthfi-1012](https://github.com/Luthfi-1012)

---

## 🚀 **Project Overview**

**Algorand-NFT** is a blockchain-based ticketing system that turns event tickets into **NFTs** (non-fungible tokens).
It ensures fairness, prevents scalping, and rewards organizers through **automated royalty mechanisms** on secondary sales.
After an event, each ticket transforms into a **digital collectible**, preserving memories and authenticity forever.

💡 **Core Features:**

* 🎫 NFT Ticketing via Algorand ARC standards
* 🔒 Ticket freezing until event day (anti-scalping)
* 💰 Automatic royalty for organizers on secondary market sales
* 🪙 Collectible NFT post-event
* 🧠 Smart Contract logic with **Algopy**
* 🌐 Easy integration with frontends via **Algokit Utils**

---

## 🌍 **Vision**

> “To revolutionize event access by turning every ticket into a secure, collectible digital asset.”

Algorand-NFT envisions a world where **tickets are not just passes, but digital memories**.
By combining Algorand’s scalability, low fees, and environmental efficiency, the project empowers artists, organizers, and fans to interact transparently — no intermediaries, no fraud, no scalping.

---

## ⚙️ **Architecture Overview**

| Layer                   | Technology                  | Purpose                                      |
| ----------------------- | --------------------------- | -------------------------------------------- |
| 🧠 Smart Contract       | Algopy (Python on Algorand) | NFT minting, freezing, and royalty logic     |
| 💻 Backend / Deployment | AlgoKit Utils + PyTeal      | Contract deployment & interaction            |
| 🌐 Frontend             | React / Next.js (optional)  | Event management and ticket purchasing UI    |
| 🔗 Blockchain           | Algorand Testnet / Mainnet  | NFT storage and secure transaction execution |

---

## 🛠 **Project Plan**

1. **Smart Contract Design** — Implement NFT creation, freeze, and royalty logic using Algopy.
2. **Ticket Lifecycle** — Define ticket states: minted, frozen, transferable, collectible.
3. **Royalty Mechanism** — Add automatic payment split to event organizers on resale.
4. **Frontend Integration** — Develop a React-based interface for ticket management.
5. **Testing & QA** — Unit test smart contracts and simulate resale transactions.
6. **Deployment** — Deploy via AlgoKit to Algorand Testnet, later to Mainnet.

---

## 💬 **Story Behind the Project**

> “I built Algorand-NFT to solve one of the biggest problems in events — ticket scalping.”

In traditional systems, resellers exploit demand with unfair pricing.
By leveraging **Algorand’s speed and automation**, this project ensures tickets stay fair, secure, and verifiable.
Organizers get rewarded, fans get authentic NFTs, and events become more transparent than ever.

---

## ⚡ **Installation Guide**

```bash
# 1️⃣ Clone the repository
git clone https://github.com/Luthfi-1012/Algorand-NFT.git

# 2️⃣ Navigate to the smart contracts directory
cd Algorand-NFT/smart_contracts

# 3️⃣ (Optional) Create a Python environment
poetry install

# 4️⃣ Compile the smart contract
algokit compile

# 5️⃣ Deploy to testnet
algokit project deploy testnet
```

Once deployed, the app will output the **App ID** and **contract address** for NFT operations.

---

## 🧾 **Deployed Application Info**

| Network | Application ID |
| ------- | -------------- |
| Testnet | **748999956**  |

> You can interact with the deployed contract using this App ID via AlgoExplorer or SDK scripts.

Example:

```python
APP_ID = 748999956
```

---

## 💫 **About Algorand**

Algorand is a **carbon-neutral Layer-1 blockchain** focused on speed, security, and sustainability.
With sub-second finality and negligible fees, it’s ideal for NFT and DeFi applications that require efficiency and transparency.
Using **Algopy** and **AlgoKit**, developers can build full-stack dApps in pure Python, bridging accessibility and performance.

---

## 📄 **License**

This project is open-source and available under the [MIT License](LICENSE).

---

🎟️ *Algorand-NFT — Redefining Event Access Through Decentralized Trust.* 🔗
