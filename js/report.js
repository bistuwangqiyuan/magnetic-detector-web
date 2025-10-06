/**
 * 磁检测仪器网页版 - 报告生成功能
 * PDF报告生成（需要集成jsPDF库）
 */

// ==================== 报告生成器类 ====================
class ReportGenerator {
    constructor() {
        this.templates = {
            standard: 'ISO标准报告',
            simple: '简化报告',
            detailed: '详细报告'
        };
    }

    /**
     * 生成HTML报告预览
     * @param {Object} testRecord - 测试记录
     * @param {Array} defects - 缺陷列表
     * @param {Object} waveformData - 波形数据
     * @returns {string} HTML字符串
     */
    generateHTML(testRecord, defects, waveformData) {
        const html = `
            <!DOCTYPE html>
            <html lang="zh-CN">
            <head>
                <meta charset="UTF-8">
                <title>磁检测报告 - ${testRecord.workpiece_id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .section { margin: 30px 0; }
                    .section-title { font-size: 18px; font-weight: bold; color: #333; border-left: 4px solid #FF6B1A; padding-left: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    table td, table th { border: 1px solid #ddd; padding: 8px; }
                    table th { background-color: #f2f2f2; }
                    .badge { padding: 4px 8px; border-radius: 4px; color: white; }
                    .badge-pass { background-color: #28a745; }
                    .badge-fail { background-color: #dc3545; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>磁漏检测报告</h1>
                    <p>报告编号: RPT-${Date.now()}</p>
                    <p>生成日期: ${formatDateTime(new Date())}</p>
                </div>

                <div class="section">
                    <div class="section-title">测试信息</div>
                    <table>
                        <tr><td>工件编号</td><td>${testRecord.workpiece_id}</td></tr>
                        <tr><td>材质</td><td>${testRecord.workpiece_material}</td></tr>
                        <tr><td>规格</td><td>${testRecord.workpiece_spec || '--'}</td></tr>
                        <tr><td>测试类型</td><td>${testRecord.test_type}</td></tr>
                        <tr><td>测试日期</td><td>${formatDateTime(testRecord.test_date)}</td></tr>
                        <tr><td>操作员</td><td>${testRecord.operator}</td></tr>
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">测试参数</div>
                    <table>
                        <tr><td>采样频率</td><td>${testRecord.sampling_rate} Hz</td></tr>
                        <tr><td>灵敏度</td><td>${testRecord.sensitivity}</td></tr>
                        <tr><td>上门限</td><td>${testRecord.upper_gate}%</td></tr>
                        <tr><td>下门限</td><td>${testRecord.lower_gate}%</td></tr>
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">检测结果</div>
                    <table>
                        <tr>
                            <td>缺陷数量</td>
                            <td>${testRecord.defect_count}</td>
                        </tr>
                        <tr>
                            <td>测试结论</td>
                            <td>
                                <span class="badge badge-${testRecord.test_result === 'pass' ? 'pass' : 'fail'}">
                                    ${testRecord.test_result === 'pass' ? '合格' : '不合格'}
                                </span>
                            </td>
                        </tr>
                    </table>
                </div>

                ${defects.length > 0 ? `
                <div class="section">
                    <div class="section-title">缺陷详情</div>
                    <table>
                        <thead>
                            <tr>
                                <th>序号</th>
                                <th>缺陷类型</th>
                                <th>严重程度</th>
                                <th>位置(mm)</th>
                                <th>峰值幅值</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${defects.map((defect, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${DEFECT_TYPES[defect.defect_type]?.name || defect.defect_type}</td>
                                    <td>${defect.defect_severity}</td>
                                    <td>${defect.position_start.toFixed(2)} - ${defect.position_end.toFixed(2)}</td>
                                    <td>${defect.amplitude_peak.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ` : ''}

                <div class="section">
                    <div class="section-title">备注</div>
                    <p>${testRecord.notes || '无'}</p>
                </div>

                <div class="section" style="margin-top: 60px;">
                    <table style="border: none;">
                        <tr style="border: none;">
                            <td style="border: none; width: 33%;">检测员签字: ___________</td>
                            <td style="border: none; width: 33%;">审核员签字: ___________</td>
                            <td style="border: none; width: 33%;">日期: ___________</td>
                        </tr>
                    </table>
                </div>
            </body>
            </html>
        `;
        
        return html;
    }

    /**
     * 生成PDF报告（需要jsPDF库）
     * @param {Object} testRecord - 测试记录
     * @param {Array} defects - 缺陷列表
     * @returns {Promise<Blob>} PDF文件Blob
     */
    async generatePDF(testRecord, defects) {
        // 检查jsPDF是否已加载
        if (typeof jsPDF === 'undefined') {
            Logger.error('jsPDF库未加载');
            throw new Error('PDF生成库未加载');
        }

        // 这里需要集成jsPDF库来生成实际的PDF
        // 由于当前是演示版本，返回提示信息
        Logger.info('PDF生成功能需要集成jsPDF库');
        showMessage('PDF报告生成功能开发中，请使用HTML预览', 'info');
        
        return null;
    }

    /**
     * 下载HTML报告
     * @param {string} html - HTML内容
     * @param {string} filename - 文件名
     */
    downloadHTML(html, filename) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `report_${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 打印报告
     * @param {string} html - HTML内容
     */
    printReport(html) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    }

    /**
     * 保存报告到数据库
     * @param {Object} reportData - 报告数据
     * @returns {Promise<Object>} 保存的报告记录
     */
    async saveToDatabase(reportData) {
        try {
            const report = await createReport({
                test_record_id: reportData.test_record_id,
                report_title: reportData.title,
                report_type: reportData.type || 'standard',
                generated_by: reportData.operator || 'System',
                file_url: reportData.file_url || null,
                file_size: reportData.file_size || null
            });
            
            Logger.info('报告已保存到数据库', report.id);
            return report;
        } catch (error) {
            Logger.error('保存报告失败:', error);
            throw error;
        }
    }
}

// ==================== 导出 ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ReportGenerator };
}
