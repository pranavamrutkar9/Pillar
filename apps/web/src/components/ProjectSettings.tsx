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
  const [newLabelColor, setNewLabelColor] = useState("#FFE600");
  
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
    <div className="space-y-8 max-w-4xl font-sans">
      
      {error && (
        <div className="p-3.5 bg-[#FF6B6B] text-black border-2 border-black font-bold text-xs flex items-center gap-2 shadow-neo-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Statuses Section */}
      <section className="bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo">
        <div className="flex items-center justify-between px-5 py-3 border-b-3 border-black dark:border-white bg-[#FFE600] text-black">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-black" />
            <h2 className="text-xs font-black uppercase tracking-wider">Workflow Statuses</h2>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            {statuses.length} Columns
          </span>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs font-medium text-black/70 dark:text-white/70">
            Customize the stages of your engineering pipeline. Edit titles directly or add new columns.
          </p>

          <div className="space-y-2">
            {statuses.map((status) => (
              <div 
                key={status.id} 
                className="flex items-center justify-between p-2.5 border-2 border-black dark:border-white bg-[#FFFDF8] dark:bg-[#20222a]"
              >
                <input
                  type="text"
                  value={status.name}
                  onChange={(e) => handleUpdateStatus(status.id, { name: e.target.value })}
                  className="bg-transparent text-xs font-bold text-black dark:text-white focus:outline-none focus:bg-white dark:focus:bg-black px-2 py-1 border border-transparent focus:border-black dark:focus:border-white"
                  disabled={loading}
                />
                <button
                  onClick={() => handleDeleteStatus(status.id)}
                  disabled={loading}
                  className={`text-xs px-2.5 py-1 font-bold border-2 border-black transition-all cursor-pointer ${
                    confirmDelete === status.id 
                      ? 'bg-[#FF6B6B] text-black shadow-neo-sm' 
                      : 'bg-white dark:bg-black text-black dark:text-white hover:bg-[#FF6B6B] hover:text-black'
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
              className="flex-1 px-3 py-2 text-xs font-medium bg-white dark:bg-[#20222a] border-2 border-black dark:border-white text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newStatusName.trim()}
              className="px-4 py-2 bg-[#FFE600] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 cursor-pointer"
            >
              Add Status
            </button>
          </form>
        </div>
      </section>

      {/* Labels Section */}
      <section className="bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo">
        <div className="flex items-center justify-between px-5 py-3 border-b-3 border-black dark:border-white bg-[#4ADE80] text-black">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-black" />
            <h2 className="text-xs font-black uppercase tracking-wider">Issue Labels</h2>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            {labels.length} Defined
          </span>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs font-medium text-black/70 dark:text-white/70">
            Tag and categorize tickets across your repository for quick filtering and sprint planning.
          </p>

          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <div 
                key={label.id} 
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#20222a] border-2 border-black dark:border-white shadow-neo-sm text-xs font-black"
              >
                <span className="w-3 h-3 rounded-none border border-black shrink-0" style={{ backgroundColor: label.color || "#FFE600" }} />
                <span className="text-black dark:text-white uppercase tracking-wider">{label.name}</span>
                <button
                  onClick={() => handleDeleteLabel(label.id)}
                  disabled={loading}
                  className={`ml-1 text-xs px-1 font-black cursor-pointer ${
                    confirmDelete === label.id ? 'bg-[#FF6B6B] text-black border border-black' : 'text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white'
                  }`}
                >
                  {confirmDelete === label.id ? 'Sure?' : '×'}
                </button>
              </div>
            ))}
            {labels.length === 0 && <span className="text-xs text-black/50 dark:text-white/50 font-bold">No labels created yet.</span>}
          </div>

          <form onSubmit={handleAddLabel} className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="New label name (e.g. Frontend)..."
              className="flex-1 px-3 py-2 text-xs font-medium bg-white dark:bg-[#20222a] border-2 border-black dark:border-white text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
              disabled={loading}
            />
            <input
              type="color"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
              className="w-10 h-10 border-2 border-black dark:border-white cursor-pointer bg-white p-0.5"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newLabelName.trim()}
              className="px-4 py-2 bg-[#4ADE80] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 cursor-pointer"
            >
              Add Label
            </button>
          </form>
        </div>
      </section>

      {/* Public Share Links Section */}
      <section className="bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo">
        <div className="flex items-center justify-between px-5 py-3 border-b-3 border-black dark:border-white bg-[#38BDF8] text-black">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-black" />
            <h2 className="text-xs font-black uppercase tracking-wider">Public Read-Only Sharing</h2>
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
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Link</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs font-medium text-black/70 dark:text-white/70">
            Generate secure tokens to share your live issue board with clients or stakeholders without granting write access.
          </p>

          <div className="space-y-2.5">
            {shares.length === 0 ? (
              <p className="text-xs text-black/50 dark:text-white/50 font-bold">No active share links.</p>
            ) : (
              shares.map((share) => (
                <div 
                  key={share.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-2 border-black dark:border-white bg-[#FFFDF8] dark:bg-[#20222a] gap-3"
                >
                  <div className="flex-1 truncate text-xs font-mono font-bold text-black dark:text-white">
                    {`${typeof window !== 'undefined' ? window.location.origin : ''}/projects/${project.id}/issues?viewerToken=${share.token}`}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyLink(share.token)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFE600] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
                    >
                      {copiedLink === share.token ? (
                        <><Check className="w-3 h-3 text-black" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3 text-black" /> Copy</>
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
                      className="px-3 py-1.5 bg-[#FF6B6B] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* GitHub Integration Section */}
      <section className="bg-white dark:bg-[#181920] border-3 border-black dark:border-white shadow-neo">
        <div className="flex items-center justify-between px-5 py-3 border-b-3 border-black dark:border-white bg-[#C084FC] text-black">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-black" />
            <h2 className="text-xs font-black uppercase tracking-wider">GitHub Repository Connection</h2>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            {project.githubRepositoryId ? 'Connected' : 'Unlinked'}
          </span>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs font-medium text-black/70 dark:text-white/70">
            Automate issue status updates when Pull Requests are created or merged in your linked GitHub repository.
          </p>

          {project.githubRepositoryId ? (
            <div className="space-y-4">
              <div className="p-4 border-2 border-black dark:border-white bg-[#4ADE80]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-black dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <Check className="w-4 h-4 text-[#16A34A]" /> Repository Synchronized
                  </p>
                  <p className="text-xs font-medium text-black/70 dark:text-white/70 mt-0.5">Pull requests automatically associate with issues by sequence ID (e.g., #PIL-42).</p>
                </div>
                <button 
                  onClick={handleSyncGithub} 
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#20222a] border-2 border-black dark:border-white text-xs font-black uppercase tracking-wider text-black dark:text-white shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
                </button>
              </div>

              <form onSubmit={handleUpdateGithubStatus} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5">
                    Target Status on PR Merge
                  </label>
                  <select 
                    value={githubMergedStatusId}
                    onChange={e => setGithubMergedStatusId(e.target.value)}
                    className="w-full max-w-sm px-3.5 py-2 text-xs font-bold bg-white dark:bg-[#20222a] border-2 border-black dark:border-white text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFE600] cursor-pointer"
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
                  className="px-4 py-2 bg-[#FFE600] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Save Transition Rule
                </button>
              </form>
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-black dark:border-white text-center space-y-3">
              <p className="text-xs font-bold text-black/60 dark:text-white/60">No GitHub repository connected to this project yet.</p>
              <a 
                href={installUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFE600] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
              >
                <span>Install GitHub Integration</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
