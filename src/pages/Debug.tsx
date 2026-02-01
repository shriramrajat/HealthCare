import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationTester = ({ log }: { log: (msg: string) => void }) => {
    const { addSystemNotification } = useNotifications();

    const handleTest = async () => {
        try {
            await addSystemNotification({
                title: 'Test Notification',
                message: 'This is a test notification from the debug page.',
                type: 'info'
            });
            log('✅ Notification sent!');
        } catch (e: any) {
            log(`❌ Notification failed: ${e.message}`);
        }
    };

    return (
        <button onClick={handleTest} className="bg-purple-600 text-white px-4 py-2 rounded">
            Test Notification
        </button>
    );
};

const DebugPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [logs, setLogs] = useState<string[]>([]);
    const [configStatus, setConfigStatus] = useState<any>({});

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].slice(0, 8)}: ${msg}`]);

    useEffect(() => {
        // Check config loading
        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
        setConfigStatus({
            apiKeyPresent: !!apiKey,
            apiKeyPrefix: apiKey ? apiKey.substring(0, 5) + '...' : 'MISSING',
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        });
        addLog('Debug component mounted.');
    }, []);

    const testLogin = async () => {
        try {
            addLog(`Attempting login for ${email}...`);
            const cred = await signInWithEmailAndPassword(auth, email, password);
            addLog(`✅ Success! User UID: ${cred.user.uid}`);
        } catch (e: any) {
            addLog(`❌ Error: ${e.code} - ${e.message}`);
            console.error(e);
        }
    };

    const checkProviders = async () => {
        try {
            addLog(`Checking providers for ${email}...`);
            const methods = await fetchSignInMethodsForEmail(auth, email);
            addLog(`Methods available: ${methods.join(', ')}`);
        } catch (e: any) {
            addLog(`❌ Error checking providers: ${e.code} - ${e.message}`);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Authentication Debugger</h1>

            <div className="bg-gray-100 p-4 rounded text-sm font-mono">
                <h3 className="font-bold mb-2">Environment Config:</h3>
                <pre>{JSON.stringify(configStatus, null, 2)}</pre>
            </div>

            <div className="space-y-4 border p-4 rounded">
                <h3 className="font-bold">Manual Sign In Test</h3>
                <input
                    className="border p-2 w-full"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    className="border p-2 w-full"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <div className="flex space-x-2">
                    <button onClick={testLogin} className="bg-blue-600 text-white px-4 py-2 rounded">
                        Test Sign In
                    </button>
                    <button onClick={checkProviders} className="bg-gray-600 text-white px-4 py-2 rounded">
                        Check Providers
                    </button>
                    <NotificationTester log={addLog} />
                </div>
            </div>

            <div className="bg-black text-green-400 p-4 rounded h-64 overflow-y-auto font-mono text-xs">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
        </div>
    );
};

export default DebugPage;
