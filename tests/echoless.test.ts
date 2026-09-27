import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analysisService } from '../src/services/analysis.service.js';
import { hindsightService } from '../src/services/hindsight.service.js';
import { SAMPLE_PROJECT_INPUTS } from '../src/lib/demo-data.js';

describe('ECHOLESS Organizational Near-Miss Memory Suite', () => {
  describe('Input Validation', () => {
    it('should reject analysis with empty project name', async () => {
      await assert.rejects(
        async () => {
          await analysisService.analyzeProject(
            {
              name: '',
              description: 'Valid description',
              technology: 'Node.js',
              expectedScale: '10k',
              criticalDependencies: 'PostgreSQL',
              rolloutPlan: 'Canary',
            },
            'on'
          );
        },
        {
          name: 'Error',
          message: 'Project Name and Description are required for risk analysis.',
        }
      );
    });

    it('should reject analysis with empty description', async () => {
      await assert.rejects(
        async () => {
          await analysisService.analyzeProject(
            {
              name: 'Valid Name',
              description: '',
              technology: 'Node.js',
              expectedScale: '10k',
              criticalDependencies: 'PostgreSQL',
              rolloutPlan: 'Canary',
            },
            'on'
          );
        },
        {
          name: 'Error',
          message: 'Project Name and Description are required for risk analysis.',
        }
      );
    });
  });

  describe('Memory OFF vs Memory ON Behavior', () => {
    it('Memory OFF should generate baseline generic checklist without historical precedents', async () => {
      const result = await analysisService.analyzeProject(SAMPLE_PROJECT_INPUTS.phoenix, 'off');

      assert.equal(result.memoryMode, 'off');
      assert.equal(result.memorySource, 'baseline_no_memory');
      assert.equal(result.riskEcho.detected, false);
      assert.equal(result.riskEcho.matchCount, 0);
      assert.equal(result.evidence.length, 0);
      assert.match(result.aiReasoningSummary, /standard deployment practices/i);
      assert.equal(result.whatChanged[0].analysis, 'Not enough historical evidence to compare without organizational memory.');
    });

    it('Memory ON should execute recall & reflect and detect historical risk echo', async () => {
      const result = await analysisService.analyzeProject(SAMPLE_PROJECT_INPUTS.phoenix, 'on');

      assert.equal(result.memoryMode, 'on');
      assert.equal(result.riskEcho.detected, true);
      assert.ok(result.riskEcho.matchCount >= 1);
      assert.match(result.riskEcho.primaryProjectMatch, /Project Orion/i);
      assert.ok(result.evidence.length > 0);
      assert.ok(result.whatChanged.length > 0);
    });
  });

  describe('What Changed? Grounded Comparison', () => {
    it('should include STILL SIMILAR and DIVERGED/CHANGED aspects', async () => {
      const result = await analysisService.analyzeProject(SAMPLE_PROJECT_INPUTS.phoenix, 'on');

      const aspects = result.whatChanged.map((w) => w.aspect);
      assert.ok(aspects.includes('Core Database Dependency'));
      assert.ok(aspects.includes('Connection Proxy & Pooling'));

      const dbAspect = result.whatChanged.find((w) => w.aspect === 'Core Database Dependency');
      assert.equal(dbAspect?.status, 'still_similar');
      assert.match(dbAspect?.past || '', /Project Orion/);
      assert.match(dbAspect?.today || '', /Phoenix API Migration/);
    });
  });

  describe('Evidence Panel & Attribution', () => {
    it('should strictly classify evidence into HISTORICAL_FACT, CURRENT_INPUT, and AI_INTERPRETATION', async () => {
      const result = await analysisService.analyzeProject(SAMPLE_PROJECT_INPUTS.phoenix, 'on');

      const classifications = result.evidence.map((e) => e.classification);
      assert.ok(classifications.includes('HISTORICAL_FACT'));
      assert.ok(classifications.includes('CURRENT_INPUT'));
      assert.ok(classifications.includes('AI_INTERPRETATION'));

      for (const ev of result.evidence) {
        assert.ok(ev.whyItMatters.length > 10);
        assert.ok(ev.memoryText.length > 10);
      }
    });
  });

  describe('Save Lesson Flow', () => {
    it('should retain new lesson in memory and return memoryId', async () => {
      const initialMemories = await hindsightService.listMemories();
      const initialCount = initialMemories.length;

      const saveRes = await analysisService.saveLesson({
        project: 'Project Valkyrie Phase 2',
        warning: 'Testing queue backpressure under mock load',
        decision: 'Throttled message workers during peak',
        action: 'Deployed rate limiter',
        outcome: 'Zero messages dropped',
        lesson: 'Always apply circuit breakers to ingress queue workers',
        mitigation: 'Ingress circuit breaker with 5s trip window',
        tags: ['valkyrie', 'queue'],
      });

      assert.equal(saveRes.success, true);
      assert.ok(saveRes.memoryId.startsWith('lesson-'));

      const updatedMemories = await hindsightService.listMemories();
      assert.equal(updatedMemories.length, initialCount + 1);
    });
  });

  describe('Hindsight Service Health and Fallbacks', () => {
    it('should return health status object with memory count', async () => {
      const health = await hindsightService.getHealth();
      assert.ok(['connected', 'unavailable', 'configured'].includes(health.status));
      assert.ok(typeof health.memoryCount === 'number');
      assert.ok(health.memoryCount >= 12);
      assert.equal(health.bankId, hindsightService.getBankId());
    });

    it('should safely handle recall and reflect without uncaught exceptions', async () => {
      const recallRes = await hindsightService.recall('database connection pools');
      assert.ok(recallRes);
      assert.ok(['hindsight', 'local'].includes(recallRes.source));

      const reflectRes = await hindsightService.reflect('recurring deployment failures');
      assert.ok(reflectRes);
      assert.ok(['hindsight', 'local'].includes(reflectRes.source));
    });
  });
});
