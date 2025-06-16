"use client"; // 声明为客户端组件，因为我们使用了 hooks

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';


// --- 图标组件 ---
const PaperclipIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
);

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);


// --- 背景动画组件 ---
function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full text-slate-950" viewBox="0 0 696 316" fill="none" xmlns="http://www.w3.org/2000/svg">
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{ pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] }}
                        transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, ease: "linear" }}
                    />
                ))}
            </svg>
        </div>
    );
}

// --- 聊天窗口组件 ---
// 定义消息类型的接口
interface Message {
    role: 'user' | 'assistant';
    content: string;
}

// 代码块渲染组件
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CodeBlock = ({ inline, className, children, ...props }: any) => {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const code = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code-snippet.${match ? match[1] : 'txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return !inline && match ? (
        <div className="relative my-4 rounded-lg bg-gray-800 text-sm">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-700 rounded-t-lg">
                <span className="text-gray-300 text-xs">{match[1]}</span>
                <div className="flex items-center gap-x-2">
                    <button onClick={handleCopy} className="p-1 text-gray-300 hover:text-white transition-colors">
                        {copied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                    </button>
                    <button onClick={handleDownload} className="p-1 text-gray-300 hover:text-white transition-colors">
                       <DownloadIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                {...props}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className="bg-gray-200 text-red-600 px-1 rounded-sm" {...props}>
            {children}
        </code>
    );
};


function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [enableDeepSearch, setEnableDeepSearch] = useState(false);
    const [enableWebSearch, setEnableWebSearch] = useState(false);
    const [enableMarkdownOutput, setEnableMarkdownOutput] = useState(false);
    const [selectedModel, setSelectedModel] = useState('deepseek-chat');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleSendMessage = async () => {
        if ((!input.trim() && !selectedFile) || isLoading) return;
        setIsLoading(true);
        
        const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
        if (!apiKey) {
            console.error("API Key is not configured.");
            setMessages(prev => [...prev, { role: 'assistant', content: `抱歉，客户端API Key未配置。请在Vercel项目中检查名为 NEXT_PUBLIC_DEEPSEEK_API_KEY 的环境变量是否正确设置，并确保已清理缓存并重新部署。` }]);
            setIsLoading(false);
            return;
        }

        let fileContent = '';
        if (selectedFile) {
            try {
                fileContent = await selectedFile.text();
            } catch (error) {
                console.error("Error reading file:", error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                setMessages(prev => [...prev, { role: 'assistant', content: `抱歉，读取文件失败: ${errorMessage}` }]);
                setIsLoading(false);
                return;
            }
        }
        
        const deepSearchInfo = enableDeepSearch ? "\n\n(深度搜索已开启)" : "";
        const webSearchInfo = enableWebSearch ? "\n\n(联网搜索已开启)" : "";
        const markdownInfo = enableMarkdownOutput ? "\n\n(请用Markdown语法格式化输出，并将最终结果放入一个代码块中)" : "";
        
        let promptContent = input;
        if (fileContent) {
            promptContent = `[上传文件内容]:\n${fileContent}\n\n[我的问题]:\n${input}${deepSearchInfo}${webSearchInfo}${markdownInfo}`;
        } else {
            promptContent = `${input}${deepSearchInfo}${webSearchInfo}${markdownInfo}`;
        }

        const newUserMessage: Message = { role: 'user', content: promptContent };
        const newMessages = [...messages, newUserMessage];
        setMessages(newMessages);

        setInput('');
        setSelectedFile(null);
        if(fileInputRef.current) fileInputRef.current.value = '';

        try {
            const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
            const response = await fetch(DEEPSEEK_API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({ model: selectedModel, messages: newMessages }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error ? errorData.error.message : 'API请求失败');
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message;
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error calling DeepSeek API:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setMessages(prev => [...prev, { role: 'assistant', content: `抱歉，出错了: ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col w-[90vw] max-w-3xl h-[75vh] max-h-[700px] bg-white/60 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 overflow-hidden"
        >
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex my-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg px-4 py-2 max-w-lg whitespace-pre-wrap shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-800'}`}>
                                {msg.role === 'assistant' && enableMarkdownOutput ? (
                                    <div className="prose dark:prose-invert max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                code: CodeBlock,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start my-3">
                            <div className="rounded-lg px-4 py-2 max-w-lg bg-gray-50 text-gray-800 shadow-sm">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 bg-transparent border-t border-black/10">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mb-2">
                        <div className="flex items-center space-x-2">
                            <label htmlFor="model-select" className="text-sm font-medium text-gray-700">模型:</label>
                            <select id="model-select" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white/80">
                                <option value="deepseek-chat">DeepSeek-V3</option>
                                <option value="deepseek-reasoner">DeepSeek-R1</option>
                            </select>
                        </div>
                        <label htmlFor="deep-search-toggle" className="flex items-center cursor-pointer">
                            <span className="mr-2 text-sm font-medium text-gray-700">深度搜索:</span>
                            <div className="relative">
                                <input id="deep-search-toggle" type="checkbox" className="sr-only peer" checked={enableDeepSearch} onChange={() => setEnableDeepSearch(!enableDeepSearch)} />
                                <div className="block bg-gray-200/80 w-10 h-6 rounded-full peer-checked:bg-blue-500 transition"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4`}></div>
                            </div>
                        </label>
                        <label htmlFor="web-search-toggle" className="flex items-center cursor-pointer">
                            <span className="mr-2 text-sm font-medium text-gray-700">联网搜索:</span>
                            <div className="relative">
                                <input id="web-search-toggle" type="checkbox" className="sr-only peer" checked={enableWebSearch} onChange={() => setEnableWebSearch(!enableWebSearch)} />
                                <div className="block bg-gray-200/80 w-10 h-6 rounded-full peer-checked:bg-blue-500 transition"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4`}></div>
                            </div>
                        </label>
                        <label htmlFor="markdown-toggle" className="flex items-center cursor-pointer">
                            <span className="mr-2 text-sm font-medium text-gray-700">Markdown输出:</span>
                            <div className="relative">
                                <input id="markdown-toggle" type="checkbox" className="sr-only peer" checked={enableMarkdownOutput} onChange={() => setEnableMarkdownOutput(!enableMarkdownOutput)} />
                                <div className="block bg-gray-200/80 w-10 h-6 rounded-full peer-checked:bg-blue-500 transition"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4`}></div>
                            </div>
                        </label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-white/50 focus:outline-none">
                            <PaperclipIcon className="w-5 h-5"/>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="在此输入您的问题..." rows={1} className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white/80" disabled={isLoading}/>
                        <button onClick={handleSendMessage} disabled={isLoading || (!input.trim() && !selectedFile)} className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-blue-300 disabled:cursor-not-allowed">
                            {isLoading ? '发送中...' : '发送'}
                        </button>
                    </div>
                    {selectedFile && (
                        <div className="mt-2 text-sm text-gray-600 flex items-center">
                            <span>已选择: {selectedFile.name}</span>
                            <button onClick={() => {setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = '';}} className="ml-2 text-red-500 hover:text-red-700"><XIcon className="w-4 h-4"/></button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// --- 主页面组件 ---
export default function Home() {
    const title = "Apex—DeepSeek";
    const words = title.split(" ");
  
    return (
        <main className="relative w-screen h-screen overflow-hidden bg-white text-slate-950">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />

            <div className="relative w-full h-full flex flex-col items-center justify-center z-10 p-4 overflow-y-auto">
                <div className="text-center flex-shrink-0">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="max-w-4xl mx-auto">
                        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-4 tracking-tighter">
                            {words.map((word, wordIndex) => (
                                <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                                    {word.split("").map((letter, letterIndex) => (
                                        <motion.span
                                            key={`${wordIndex}-${letterIndex}`}
                                            initial={{ y: 100, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: wordIndex * 0.1 + letterIndex * 0.03, type: "spring", stiffness: 150, damping: 25 }}
                                            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 to-neutral-700/80"
                                        >
                                            {letter}
                                        </motion.span>
                                    ))}
                                </span>
                            ))}
                        </h1>
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 1.2 }} className="text-lg md:text-xl text-neutral-600 mt-4 max-w-2xl mx-auto">
                            Apex专属满血版DeepSeek，独立运营，不卡顿。
                        </motion.p>
                    </motion.div>
                </div>
                <div className="mt-8">
                    <ChatWindow />
                </div>
            </div>
        </main>
    );
}
