import { CONFIG, Agent, AGENT_REGISTRY_ABI } from './config';

/**
 * 通过 RPC eth_call 调用 AgentRegistry.getAgent(agentId) 查询链上 Agent 数据
 * 不依赖任何第三方库，纯 fetch + ABI 编码
 */
export async function fetchAgentInfo(agentId: string): Promise<Agent | null> {
    try {
        // ABI 编码 getAgent(string)
        const getAgentData = encodeGetAgent(agentId);

        const agentResponse = await fetch(CONFIG.RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_call',
                params: [{
                    to: CONFIG.AGENT_REGISTRY_ADDRESS,
                    data: getAgentData,
                }, 'latest'],
            }),
        });

        const agentResult = await agentResponse.json();

        if (agentResult.error || !agentResult.result || agentResult.result === '0x') {
            return null;
        }

        // 解码返回值
        const agentInfo = decodeAgentInfo(agentResult.result);
        if (!agentInfo) return null;

        // 获取 agent 余额
        const balanceData = encodeGetAgentBalance(agentId);
        const balanceResponse = await fetch(CONFIG.RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 2,
                method: 'eth_call',
                params: [{
                    to: CONFIG.AGENT_REGISTRY_ADDRESS,
                    data: balanceData,
                }, 'latest'],
            }),
        });

        const balanceResult = await balanceResponse.json();
        const balanceBig = balanceResult.result && balanceResult.result !== '0x'
            ? BigInt(balanceResult.result)
            : BigInt(0);
        
        const balance = formatWei(balanceBig);

        return {
            ...agentInfo,
            balance,
        };
    } catch (error) {
        console.error('Error fetching agent from chain:', error);
        return null;
    }
}

/**
 * 编码 getAgent(string agentId) 的调用数据
 * function selector: keccak256("getAgent(string)") 前4字节
 */
function encodeGetAgent(agentId: string): string {
    // function selector for getAgent(string)
    // keccak256("getAgent(string)") 前 4 字节
    const selector = '0x794464e9'; // keccak256("getAgent(string)") 前4字节

    // ABI 编码 string 参数
    // offset = 0x20 (32 bytes，指向字符串数据开始位置)
    const offset = '0000000000000000000000000000000000000000000000000000000000000020';

    // string length
    const encoder = new TextEncoder();
    const strBytes = encoder.encode(agentId);
    const strLen = strBytes.length.toString(16).padStart(64, '0');

    // string data (padded to 32 bytes)
    let strHex = '';
    for (const byte of strBytes) {
        strHex += byte.toString(16).padStart(2, '0');
    }
    // pad to multiple of 32 bytes
    const padLength = Math.ceil(strHex.length / 64) * 64;
    strHex = strHex.padEnd(padLength, '0');

    return selector + offset + strLen + strHex;
}

/**
 * 编码 getAgentBalance(string agentId) 的调用数据
 * function selector: keccak256("getAgentBalance(string)") 前4字节
 * Verified against Solidity: bytes4(keccak256("getAgentBalance(string)"))
 */
function encodeGetAgentBalance(agentId: string): string {
    // function selector for getAgentBalance(string)
    // keccak256("getAgentBalance(string)") = 0x0c85c9f7...
    const selector = '0x0c85c9f7';

    // ABI 编码 string 参数 (same as getAgent)
    const offset = '0000000000000000000000000000000000000000000000000000000000000020';

    const encoder = new TextEncoder();
    const strBytes = encoder.encode(agentId);
    const strLen = strBytes.length.toString(16).padStart(64, '0');

    let strHex = '';
    for (const byte of strBytes) {
        strHex += byte.toString(16).padStart(2, '0');
    }
    const padLength = Math.ceil(strHex.length / 64) * 64;
    strHex = strHex.padEnd(padLength, '0');

    return selector + offset + strLen + strHex;
}

/**
 * 解码 getAgent 返回的 ABI 编码数据
 */
function decodeAgentInfo(hex: string): Omit<Agent, 'balance'> | null {
    try {
        // 去掉 '0x' 前缀
        const data = hex.startsWith('0x') ? hex.slice(2) : hex;

        if (data.length < 64) return null;

        // 返回值是一个 tuple，首先有一个指向 tuple 数据的 offset
        // tuple 内部:
        // [0] agentId (string - offset)
        // [1] displayName (string - offset)
        // [2] wallet (address)
        // [3] tipCount (uint256)
        // [4] registeredAt (uint256)
        // [5] isActive (bool)

        // 第一个 word 是指向 tuple 的 offset
        const tupleOffset = parseInt(data.slice(0, 64), 16) * 2;
        const tupleData = data.slice(tupleOffset);

        // 读取 tuple 内部的 word
        const words: string[] = [];
        for (let i = 0; i < 12; i++) {
            words.push(tupleData.slice(i * 64, (i + 1) * 64));
        }

        // word[0] = agentId string offset (relative to tuple start)
        const agentIdOffset = parseInt(words[0], 16) * 2;
        // word[1] = displayName string offset  
        const displayNameOffset = parseInt(words[1], 16) * 2;
        // word[2] = wallet (address - last 20 bytes of 32-byte word)
        const wallet = '0x' + words[2].slice(24);
        // word[3] = tipCount (uint256)
        const tipCount = Number(BigInt('0x' + words[3]));
        // word[4] = registeredAt (uint256)
        // const registeredAt = Number(BigInt('0x' + words[4]));
        // word[5] = isActive (bool)
        const isActive = parseInt(words[5], 16) === 1;

        // 解码 agentId string
        const agentId = decodeString(tupleData, agentIdOffset);
        // 解码 displayName string
        const displayName = decodeString(tupleData, displayNameOffset);

        // 如果 wallet 全是 0，说明 agent 不存在
        if (wallet === '0x0000000000000000000000000000000000000000') {
            return null;
        }

        return {
            agentId,
            displayName,
            wallet,
            tipCount,
            isActive,
        };
    } catch (error) {
        console.error('Error decoding agent info:', error);
        return null;
    }
}

function decodeString(data: string, offset: number): string {
    const strLen = parseInt(data.slice(offset, offset + 64), 16);
    const strHex = data.slice(offset + 64, offset + 64 + strLen * 2);
    const bytes = new Uint8Array(strLen);
    for (let i = 0; i < strLen; i++) {
        bytes[i] = parseInt(strHex.slice(i * 2, i * 2 + 2), 16);
    }
    return new TextDecoder().decode(bytes);
}

function formatWei(wei: bigint): string {
    const eth = Number(wei) / 1e18;
    if (eth >= 1_000_000) return `${(eth / 1_000_000).toFixed(1)}M`;
    if (eth >= 1_000) return `${(eth / 1_000).toFixed(1)}K`;
    if (eth >= 1) return eth.toFixed(0);
    if (eth > 0) return eth.toFixed(2);
    return '0';
}

// 格式化数字
export function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
}

// 缩短地址
export function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
