"use client";

import { useState, useEffect } from "react";
import { 
  createStatusAction, 
  updateStatusAction, 
  deleteStatusAction, 
  createLabelAction, 
  updateLabelAction, 
  deleteLabelAction 
} from "../actions/settingsActions";
import { 
  createProjectShareAction, 
  getProjectSharesAction, 
  revokeProjectShareAction 
} from "../actions/shareActions";
import { 
  updateGithubSettingsAction, 
  triggerGithubSyncAction 
} from "../actions/githubActions";
import { 
  Share2, 
  GitBranch, 
  Tag, 
  Layers, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  AlertCircle,
  ExternalLink
} from "lucide-react";

export default function ProjectSettings({ project }: { project: any }) {
  const [statuses, setStatuses] = useState<any[]>(project.issueStatuses || []);
  const [labels, setLabels] = useState<any[]>(project.issueLabels || []);
  
  const [newStatusName, setNewStatusName] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#71717a");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const [shares, setShares] = useState<any[]>([]);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const [githubMergedStatusId, setGithubMergedStatusId] = useState(project.githubMergedStatusId || "");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    getProjectSharesAction(project.workspaceId, project.id)
      .then(data => setShares(data || []))
      .catch(err => console.error("Failed to load shares", err));
  }, [project.workspaceId, project.id]);

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/projects/${project.id}/issues?viewerToken=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(token);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const status = await createStatusAction(project.id, { name: newStatusName });
      setStatuses([...statuses, status]);
      setNewStatusName("");
    } catch (err: any) {
      setError(err.message || "Failed to create status");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    if (confirmDelete !== statusId) {
      setConfirmDelete(statusId);
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      await deleteStatusAction(project.id, statusId);
      setStatuses(statuses.filter((s) => s.id !== statusId));
      setConfirmDelete(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete status");
      setConfirmDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (statusId: string, updates: any) => {
    setLoading(true);
    setError("");
    try {
      const updated = await updateStatusAction(project.id, statusId, updates);
      setStatuses(statuses.map((s) => (s.id === statusId ? updated : s)));
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const label = await createLabelAction(project.id, { name: newLabelName, color: newLabelColor });
      setLabels([...labels, label]);
      setNewLabelName("");
    } catch (err: any) {
      setError(err.message || "Failed to create label");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (confirmDelete !== labelId) {
      setConfirmDelete(labelId);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await deleteLabelAction(project.id, labelId);
      setLabels(labels.filter((l) => l.id !== labelId));
      setConfirmDelete(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete label");
      setConfirmDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGithubStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateGithubSettingsAction(project.id, { githubMergedStatusId: githubMergedStatusId || null });
    } catch (err: any) {
      setError(err.message || "Failed to update GitHub settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncGithub = async () => {
    setIsSyncing(true);
    try {
      await triggerGithubSyncAction(project.id);
    } catch (err: any) {
      setError(err.message || "Failed to trigger sync");
    } finally {
      setIsSyncing(false);
    }
  };

  const GITHUB_APP_NAME = process.env.NEXT_PUBLIC_GITHUB_APP_NAME || "pillar-local-dev";
  const installUrl = `https://github.com/apps/${GITHUB_APP_NAME}/installations/new`;

  return (
    <div className="space-y-8 max-w-4xl">
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/40 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Statuses Section */}
      <section className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-500" />
            <span>Workflow Statuses</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Customize the stages of your engineering pipeline.</p>
        </div>

        <div className="space-y-2">
          {statuses.map((status) => (
            <div 
              key={status.id} 
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30"
            >
              <input
                type="text"
                value={status.name}
                onChange={(e) => handleUpdateStatus(status.id, { name: e.target.value })}
                className="bg-transparent text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 rounded px-2 py-1"
                disabled={loading}
              />
              <button
                onClick={() => handleDeleteStatus(status.id)}
                disabled={loading}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  confirmDelete === status.id 
                    ? 'bg-red-600 text-white font-medium' 
                    : 'text-zinc-400 hover:text-red-600'
                }`}
              >
                {confirmDelete === status.id ? 'Confirm Delete' : 'Delete'}
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddStatus} className="flex gap-2 pt-2">
          <input
            type="text"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            placeholder="Add new status (e.g. In QA)..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newStatusName.trim()}
            className="px-3.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 shadow-2xs"
          >
            Add Status
          </button>
        </form>
      </section>

      {/* Labels Section */}
      <section className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Tag className="w-4 h-4 text-zinc-500" />
            <span>Issue Labels</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Tag and categorize tickets across your repository.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <div 
              key={label.id} 
              className="inline-flex items-center gap-2 px-2.5 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg text-xs"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: label.color || "#71717a" }} />
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{label.name}</span>
              <button
                onClick={() => handleDeleteLabel(label.id)}
                disabled={loading}
                className={`ml-1 text-xs transition-colors ${
                  confirmDelete === label.id ? 'text-red-600 font-bold' : 'text-zinc-400 hover:text-red-500'
                }`}
              >
                {confirmDelete === label.id ? 'Sure?' : '×'}
              </button>
            </div>
          ))}
          {labels.length === 0 && <span className="text-xs text-zinc-400 italic">No labels created yet.</span>}
        </div>

        <form onSubmit={handleAddLabel} className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="New label name..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors"
            disabled={loading}
          />
          <input
            type="color"
            value={newLabelColor}
            onChange={(e) => setNewLabelColor(e.target.value)}
            className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer bg-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newLabelName.trim()}
            className="px-3.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 shadow-2xs"
          >
            Add Label
          </button>
        </form>
      </section>

      {/* Public Share Links Section */}
      <section className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-zinc-500" />
              <span>Public Read-Only Sharing</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Generate tokens to share your live board without granting write permissions.</p>
          </div>

          <button
            onClick={async () => {
              setLoading(true);
              try {
                const share = await createProjectShareAction(project.workspaceId, project.id);
                setShares([...shares, share]);
              } catch (err) {
                console.error(err);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 shadow-2xs shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Share Link</span>
          </button>
        </div>

        <div className="space-y-2">
          {shares.length === 0 ? (
            <p className="text-xs text-zinc-400 italic">No active share links.</p>
          ) : (
            shares.map((share) => (
              <div 
                key={share.id} 
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 gap-4"
              >
                <div className="flex-1 truncate text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/projects/${project.id}/issues?viewerToken=${share.token}`}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyLink(share.token)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition-colors"
                  >
                    {copiedLink === share.token ? (
                      <><Check className="w-3 h-3 text-emerald-500" /> Copied</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await revokeProjectShareAction(project.workspaceId, project.id, share.id);
                        setShares(shares.filter(s => s.id !== share.id));
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="px-2.5 py-1 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* GitHub Integration Section */}
      <section className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-zinc-500" />
            <span>GitHub Repository Connection</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Automate issue resolution when PRs are merged.</p>
        </div>

        {project.githubRepositoryId ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Repository Synchronized
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">Pull requests automatically associate with issues by sequence ID.</p>
              </div>
              <button 
                onClick={handleSyncGithub} 
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
              </button>
            </div>

            <form onSubmit={handleUpdateGithubStatus} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Target Status on PR Merge
                </label>
                <select 
                  value={githubMergedStatusId}
                  onChange={e => setGithubMergedStatusId(e.target.value)}
                  className="w-full max-w-sm px-3 py-1.5 text-xs bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-colors cursor-pointer"
                  disabled={loading}
                >
                  <option value="">-- No automatic transition --</option>
                  {statuses.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 shadow-2xs"
              >
                Save Transition Rule
              </button>
            </form>
          </div>
        ) : (
          <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
            <p className="text-xs text-zinc-400 mb-3">No GitHub repository connected yet.</p>
            <a 
              href={installUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
            >
              <span>Install GitHub Integration</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </section>

    </div>
  );
}
